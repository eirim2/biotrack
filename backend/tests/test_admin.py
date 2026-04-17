"""
test_admin.py — Tests for admin-only endpoints.

Covers user management, animal requests, animal creation with questions,
and the feedback summary.

Author: Ethan Irimiciu
"""

import pytest


class TestAdminUserManagement:
    """Tests for admin user management endpoints."""

    def test_admin_get_all_users(self, client, seed_admin, seed_student):
        """Admin should see all users."""
        res = client.get("/api/admin/users?admin_username=admin")
        assert res.status_code == 200
        usernames = [u["username"] for u in res.json()]
        assert "admin" in usernames
        assert "student1" in usernames

    def test_admin_filter_by_role(self, client, seed_admin, seed_student, seed_teacher):
        """Admin should be able to filter users by role."""
        res = client.get("/api/admin/users?admin_username=admin&role=student")
        assert res.status_code == 200
        for u in res.json():
            assert u["role"] == "student"

    def test_admin_create_teacher_account(self, client, seed_admin):
        """Admin should be able to create teacher accounts."""
        res = client.post(
            "/api/admin/create-account?admin_username=admin",
            json={"username": "newteacher", "role": "teacher"},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["username"] == "newteacher"
        assert "temp_password" in data  # should return temp password

    def test_admin_create_admin_account(self, client, seed_admin):
        """Admin should be able to create other admin accounts."""
        res = client.post(
            "/api/admin/create-account?admin_username=admin",
            json={"username": "admin2", "role": "admin"},
        )
        assert res.status_code == 200

    def test_admin_create_duplicate_username(self, client, seed_admin, seed_student):
        """Creating an account with an existing username should fail."""
        res = client.post(
            "/api/admin/create-account?admin_username=admin",
            json={"username": "student1", "role": "teacher"},
        )
        assert res.status_code == 400
        assert "already exists" in res.json()["detail"]

    def test_admin_delete_user(self, client, seed_admin, seed_student):
        """Admin should be able to delete users."""
        res = client.delete("/api/admin/users/student1?admin_username=admin")
        assert res.status_code == 200

        # Verify the user is gone
        res = client.post("/api/login", json={
            "username": "student1",
            "password": "pass123",
        })
        assert res.status_code == 401

    def test_admin_cannot_delete_self(self, client, seed_admin):
        """Admin should not be able to delete their own account."""
        res = client.delete("/api/admin/users/admin?admin_username=admin")
        assert res.status_code == 400

    def test_non_admin_cannot_access(self, client, seed_student):
        """Non-admin users should not be able to use admin endpoints."""
        res = client.get("/api/admin/users?admin_username=student1")
        assert res.status_code == 403


class TestAnimalRequests:
    """Tests for the teacher animal request workflow."""

    def test_teacher_submit_request(self, client, seed_teacher):
        """Teachers should be able to request a new animal."""
        res = client.post("/api/animal-requests", json={
            "teacher_username": "teacher1",
            "common_name": "Red Fox",
            "scientific_name": "Vulpes vulpes",
            "category": "Mammal",
            "reason": "Would be great for the forest unit",
        })
        assert res.status_code == 200
        assert "id" in res.json()

    def test_admin_view_requests(self, client, seed_admin, seed_teacher):
        """Admin should see all animal requests."""
        client.post("/api/animal-requests", json={
            "teacher_username": "teacher1",
            "common_name": "Red Fox",
            "scientific_name": "Vulpes vulpes",
            "category": "Mammal",
        })
        res = client.get("/api/admin/animal-requests?admin_username=admin")
        assert res.status_code == 200
        assert len(res.json()) == 1
        assert res.json()[0]["status"] == "pending"

    def test_admin_deny_request(self, client, seed_admin, seed_teacher):
        """Admin should be able to deny a request."""
        create_res = client.post("/api/animal-requests", json={
            "teacher_username": "teacher1",
            "common_name": "Red Fox",
            "scientific_name": "Vulpes vulpes",
            "category": "Mammal",
        })
        request_id = create_res.json()["id"]

        res = client.post(
            f"/api/admin/animal-requests/{request_id}/deny?admin_username=admin"
        )
        assert res.status_code == 200

        # Verify status changed
        requests = client.get("/api/admin/animal-requests?admin_username=admin")
        assert requests.json()[0]["status"] == "denied"


class TestAdminCreateAnimal:
    """Tests for the admin animal creation with questions endpoint."""

    def test_create_animal(self, client, seed_admin):
        """Admin should be able to create a new animal."""
        animal_data = {
            "id": 99,
            "commonName": "Test Lion",
            "scientificName": "Panthera leo",
            "category": "Mammal",
            "conservationStatus": "Vulnerable",
            "habitat": "Savanna",
            "region": "Africa",
            "diet": "Carnivore",
            "lifespan": "15 years",
            "weight": "190 kg",
            "height": "1.2 m",
            "population": "~23,000",
            "description": "The lion is a large cat.",
            "funFacts": ["Lions sleep 20 hours a day"],
            "imageKey": "",
        }
        res = client.post(
            "/api/admin/animals?admin_username=admin",
            json={"id": 99, "data": animal_data},
        )
        assert res.status_code == 200

        # Verify the animal exists
        animal_res = client.get("/api/animals/99")
        assert animal_res.status_code == 200
        assert animal_res.json()["commonName"] == "Test Lion"

    def test_create_duplicate_animal_id(self, client, seed_admin, seed_animal):
        """Creating an animal with an existing ID should fail."""
        res = client.post(
            "/api/admin/animals?admin_username=admin",
            json={"id": 1, "data": {"commonName": "Duplicate"}},
        )
        assert res.status_code == 400

    def test_save_questions_for_animal(self, client, seed_admin):
        """Admin should be able to save 8 questions for an animal."""
        # First create the animal
        client.post(
            "/api/admin/animals?admin_username=admin",
            json={"id": 50, "data": {"commonName": "Quiz Animal", "imageKey": ""}},
        )

        # Now save 8 questions
        questions = [
            {
                "question": f"Question {i+1} about the animal?",
                "options": [f"Option A{i}", f"Option B{i}", f"Option C{i}", f"Option D{i}"],
                "answer": i % 4,
            }
            for i in range(8)
        ]
        res = client.post(
            "/api/admin/animals/50/questions?admin_username=admin",
            json={"questions": questions},
        )
        assert res.status_code == 200
        assert res.json()["message"] == "Questions saved"

    def test_save_wrong_number_of_questions(self, client, seed_admin, seed_animal):
        """Saving fewer or more than 8 questions should fail."""
        questions = [
            {"question": "Q?", "options": ["A", "B", "C", "D"], "answer": 0}
            for _ in range(5)  # only 5, need 8
        ]
        res = client.post(
            "/api/admin/animals/1/questions?admin_username=admin",
            json={"questions": questions},
        )
        assert res.status_code == 400
        assert "8 questions" in res.json()["detail"]

    def test_save_question_missing_options(self, client, seed_admin, seed_animal):
        """Questions with fewer than 4 options should fail validation."""
        questions = [
            {"question": "Q?", "options": ["A", "B"], "answer": 0}  # only 2 options
        ] + [
            {"question": f"Q{i}?", "options": ["A", "B", "C", "D"], "answer": 0}
            for i in range(7)
        ]
        res = client.post(
            "/api/admin/animals/1/questions?admin_username=admin",
            json={"questions": questions},
        )
        assert res.status_code == 400

    def test_save_question_invalid_answer(self, client, seed_admin, seed_animal):
        """Answer index must be 0-3."""
        questions = [
            {"question": f"Q{i}?", "options": ["A", "B", "C", "D"], "answer": 0}
            for i in range(7)
        ] + [
            {"question": "Bad Q?", "options": ["A", "B", "C", "D"], "answer": 5}  # invalid
        ]
        res = client.post(
            "/api/admin/animals/1/questions?admin_username=admin",
            json={"questions": questions},
        )
        assert res.status_code == 400


class TestFeedback:
    """Tests for the feedback system."""

    def test_submit_student_feedback(self, client):
        """Students should be able to submit anonymous feedback."""
        res = client.post("/api/feedback", json={
            "role": "student",
            "responses": {
                "quiz_helpful": 4,
                "flashcards_helpful": 5,
                "overall_satisfaction": 4,
            },
        })
        assert res.status_code == 200

    def test_submit_teacher_feedback(self, client):
        """Teachers should be able to submit anonymous feedback."""
        res = client.post("/api/feedback", json={
            "role": "teacher",
            "responses": {
                "class_management_useful": 5,
                "overall_satisfaction": 4,
            },
        })
        assert res.status_code == 200

    def test_feedback_invalid_role(self, client):
        """Feedback with an invalid role should fail."""
        res = client.post("/api/feedback", json={
            "role": "hacker",
            "responses": {"question": 5},
        })
        assert res.status_code == 400

    def test_admin_view_feedback_summary(self, client, seed_admin):
        """Admin should see aggregated feedback."""
        # Submit some feedback first
        client.post("/api/feedback", json={
            "role": "student",
            "responses": {"overall_satisfaction": 4},
        })
        client.post("/api/feedback", json={
            "role": "student",
            "responses": {"overall_satisfaction": 5},
        })

        res = client.get("/api/admin/feedback?admin_username=admin")
        assert res.status_code == 200
        data = res.json()
        assert data["student_count"] == 2
        assert data["student"]["overall_satisfaction"]["average"] == 4.5


class TestLeaderboardAndPoints:
    """Tests for leaderboard and points system."""

    def test_award_points(self, client, seed_student):
        """Points should be awarded to students."""
        res = client.post("/api/points/award", json={
            "username": "student1",
            "points": 500,
            "source": "flashcard",
        })
        assert res.status_code == 200
        assert res.json()["total_points"] == 500

    def test_leaderboard_ordering(self, client, db):
        """Leaderboard should be sorted by points descending."""
        from main import UserModel, hash_password
        for i, pts in enumerate([100, 500, 300]):
            db.add(UserModel(
                username=f"lb_student{i}",
                password=hash_password("pass"),
                role="student",
                favorites=[], discovered=[], badges=[], quiz_scores={},
                points=pts,
            ))
        db.commit()

        res = client.get("/api/leaderboard")
        assert res.status_code == 200
        scores = [entry["total_score"] for entry in res.json()]
        assert scores == sorted(scores, reverse=True)

    def test_chatbot_questions(self, client):
        """Chatbot endpoint should return Q&A pairs."""
        res = client.get("/api/chatbot/questions")
        assert res.status_code == 200
        # Should be a list (may be empty if file not found in test env)
        assert isinstance(res.json(), list)
