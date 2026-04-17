"""
test_auth.py — Tests for registration, login, and password reset endpoints.

Author: Ethan Irimiciu
"""

import pytest


class TestRegistration:
    """Tests for POST /api/register"""

    def test_register_student_success(self, client):
        """Students should be able to register successfully."""
        res = client.post("/api/register", json={
            "username": "newstudent",
            "password": "mypassword",
            "role": "student",
        })
        assert res.status_code == 200
        data = res.json()
        assert data["user"]["username"] == "newstudent"
        assert data["user"]["role"] == "student"
        assert data["user"]["points"] == 0

    def test_register_duplicate_username(self, client):
        """Registering with an existing username should fail."""
        client.post("/api/register", json={
            "username": "duplicate",
            "password": "pass123",
            "role": "student",
        })
        res = client.post("/api/register", json={
            "username": "duplicate",
            "password": "pass456",
            "role": "student",
        })
        assert res.status_code == 400
        assert "already exists" in res.json()["detail"]

    def test_register_teacher_blocked(self, client):
        """Teachers cannot self-register — must be created by admin."""
        res = client.post("/api/register", json={
            "username": "faketeacher",
            "password": "pass123",
            "role": "teacher",
        })
        assert res.status_code == 400
        assert "administrator" in res.json()["detail"].lower()

    def test_register_admin_blocked(self, client):
        """Admins cannot self-register either."""
        res = client.post("/api/register", json={
            "username": "fakeadmin",
            "password": "pass123",
            "role": "admin",
        })
        assert res.status_code == 400


class TestLogin:
    """Tests for POST /api/login"""

    def test_login_success(self, client):
        """Valid credentials should return user data."""
        client.post("/api/register", json={
            "username": "logintest",
            "password": "secret",
            "role": "student",
        })
        res = client.post("/api/login", json={
            "username": "logintest",
            "password": "secret",
        })
        assert res.status_code == 200
        assert res.json()["user"]["username"] == "logintest"

    def test_login_wrong_password(self, client):
        """Wrong password should return 401."""
        client.post("/api/register", json={
            "username": "logintest2",
            "password": "correct",
            "role": "student",
        })
        res = client.post("/api/login", json={
            "username": "logintest2",
            "password": "wrong",
        })
        assert res.status_code == 401

    def test_login_nonexistent_user(self, client):
        """Logging in with a username that doesn't exist should fail."""
        res = client.post("/api/login", json={
            "username": "nobody",
            "password": "anything",
        })
        assert res.status_code == 401


class TestPasswordReset:
    """Tests for password reset endpoints."""

    def test_force_reset(self, client, seed_admin, db):
        """Admin-created accounts can force-reset their password."""
        from main import UserModel, hash_password
        user = UserModel(
            username="newteacher",
            password=hash_password("temp_abc123"),
            role="teacher",
            favorites=[], discovered=[], badges=[], quiz_scores={},
            must_reset_password=1,
        )
        db.add(user)
        db.commit()

        res = client.post("/api/password/force-reset", json={
            "username": "newteacher",
            "new_password": "mynewpass",
        })
        assert res.status_code == 200
        assert res.json()["user"]["must_reset_password"] == 0

    def test_force_reset_too_short(self, client, db):
        """Password must be at least 4 characters."""
        from main import UserModel, hash_password
        user = UserModel(
            username="shortpass",
            password=hash_password("temp"),
            role="teacher",
            favorites=[], discovered=[], badges=[], quiz_scores={},
            must_reset_password=1,
        )
        db.add(user)
        db.commit()

        res = client.post("/api/password/force-reset", json={
            "username": "shortpass",
            "new_password": "ab",
        })
        assert res.status_code == 400

    def test_normal_password_reset(self, client):
        """Users can reset their own password with old password."""
        client.post("/api/register", json={
            "username": "resetme",
            "password": "oldpass",
            "role": "student",
        })
        res = client.post("/api/password/reset", json={
            "username": "resetme",
            "old_password": "oldpass",
            "new_password": "newpass",
        })
        assert res.status_code == 200

        # Verify new password works
        res = client.post("/api/login", json={
            "username": "resetme",
            "password": "newpass",
        })
        assert res.status_code == 200
