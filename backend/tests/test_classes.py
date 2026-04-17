"""
test_classes.py — Tests for classroom creation, joining, and assignments.

Author: Ethan Irimiciu
"""

import pytest


class TestClassCreation:
    """Tests for class creation and management."""

    def test_create_class(self, client, seed_teacher):
        """Teachers should be able to create a class."""
        res = client.post("/api/classes/create", json={
            "teacher_username": "teacher1",
            "class_name": "Biology 101",
        })
        assert res.status_code == 200
        data = res.json()["class"]
        assert data["name"] == "Biology 101"
        assert len(data["code"]) == 6  # join code is 6 characters

    def test_create_class_non_teacher(self, client, seed_student):
        """Students should not be able to create classes."""
        res = client.post("/api/classes/create", json={
            "teacher_username": "student1",
            "class_name": "Fake Class",
        })
        assert res.status_code == 403

    def test_get_teacher_classes(self, client, seed_teacher):
        """Teachers should see their own classes."""
        client.post("/api/classes/create", json={
            "teacher_username": "teacher1",
            "class_name": "Class A",
        })
        client.post("/api/classes/create", json={
            "teacher_username": "teacher1",
            "class_name": "Class B",
        })
        res = client.get("/api/classes/teacher/teacher1")
        assert res.status_code == 200
        assert len(res.json()) == 2


class TestClassJoining:
    """Tests for students joining classes."""

    def test_join_class(self, client, seed_teacher, seed_student):
        """Students should be able to join with a valid code."""
        create_res = client.post("/api/classes/create", json={
            "teacher_username": "teacher1",
            "class_name": "Join Test",
        })
        code = create_res.json()["class"]["code"]

        res = client.post("/api/classes/join", json={
            "student_username": "student1",
            "class_code": code,
        })
        assert res.status_code == 200

    def test_join_class_invalid_code(self, client, seed_student):
        """Joining with a bad code should fail."""
        res = client.post("/api/classes/join", json={
            "student_username": "student1",
            "class_code": "XXXXXX",
        })
        assert res.status_code == 404

    def test_join_class_duplicate(self, client, seed_teacher, seed_student):
        """Joining the same class twice should not cause an error."""
        create_res = client.post("/api/classes/create", json={
            "teacher_username": "teacher1",
            "class_name": "Dup Test",
        })
        code = create_res.json()["class"]["code"]

        client.post("/api/classes/join", json={
            "student_username": "student1",
            "class_code": code,
        })
        res = client.post("/api/classes/join", json={
            "student_username": "student1",
            "class_code": code,
        })
        assert res.status_code == 200
        assert "already" in res.json()["message"].lower()

    def test_teacher_cannot_join_class(self, client, seed_teacher):
        """Teachers should not be able to join classes as students."""
        create_res = client.post("/api/classes/create", json={
            "teacher_username": "teacher1",
            "class_name": "Teacher Join Test",
        })
        code = create_res.json()["class"]["code"]

        res = client.post("/api/classes/join", json={
            "student_username": "teacher1",
            "class_code": code,
        })
        assert res.status_code == 403


class TestClassDetails:
    """Tests for class detail and student management."""

    def test_get_class_students(self, client, seed_teacher, seed_student):
        """Should list students in a class."""
        create_res = client.post("/api/classes/create", json={
            "teacher_username": "teacher1",
            "class_name": "Detail Test",
        })
        class_id = create_res.json()["class"]["id"]
        code = create_res.json()["class"]["code"]

        client.post("/api/classes/join", json={
            "student_username": "student1",
            "class_code": code,
        })

        res = client.get(f"/api/classes/{class_id}/students")
        assert res.status_code == 200
        assert len(res.json()) == 1
        assert res.json()[0]["username"] == "student1"

    def test_remove_student_from_class(self, client, seed_teacher, seed_student):
        """Teacher should be able to remove a student."""
        create_res = client.post("/api/classes/create", json={
            "teacher_username": "teacher1",
            "class_name": "Remove Test",
        })
        class_id = create_res.json()["class"]["id"]
        code = create_res.json()["class"]["code"]

        client.post("/api/classes/join", json={
            "student_username": "student1",
            "class_code": code,
        })

        res = client.delete(f"/api/classes/{class_id}/students/student1")
        assert res.status_code == 200

        # Verify student is removed
        students = client.get(f"/api/classes/{class_id}/students")
        assert len(students.json()) == 0

    def test_student_leave_class(self, client, seed_teacher, seed_student):
        """Students should be able to leave a class."""
        create_res = client.post("/api/classes/create", json={
            "teacher_username": "teacher1",
            "class_name": "Leave Test",
        })
        class_id = create_res.json()["class"]["id"]
        code = create_res.json()["class"]["code"]

        client.post("/api/classes/join", json={
            "student_username": "student1",
            "class_code": code,
        })

        res = client.delete(f"/api/classes/{class_id}/leave/student1")
        assert res.status_code == 200


class TestAssignments:
    """Tests for assignment creation and completion."""

    def test_create_animal_quiz_assignment(self, client, seed_teacher, seed_animal):
        """Teacher should be able to assign an animal quiz."""
        create_res = client.post("/api/classes/create", json={
            "teacher_username": "teacher1",
            "class_name": "Assignment Test",
        })
        class_id = create_res.json()["class"]["id"]

        res = client.post("/api/assignments", json={
            "class_id": class_id,
            "teacher_username": "teacher1",
            "assignment_type": "animal_quiz",
            "animal_id": 1,
        })
        assert res.status_code == 200
        assert res.json()["assignment"]["assignment_type"] == "animal_quiz"

    def test_complete_assignment(self, client, seed_teacher, seed_student, seed_animal):
        """Student should be able to complete an assignment."""
        create_res = client.post("/api/classes/create", json={
            "teacher_username": "teacher1",
            "class_name": "Complete Test",
        })
        class_id = create_res.json()["class"]["id"]
        code = create_res.json()["class"]["code"]

        client.post("/api/classes/join", json={
            "student_username": "student1",
            "class_code": code,
        })

        assign_res = client.post("/api/assignments", json={
            "class_id": class_id,
            "teacher_username": "teacher1",
            "assignment_type": "animal_quiz",
            "animal_id": 1,
        })
        assignment_id = assign_res.json()["assignment"]["id"]

        res = client.post("/api/assignments/complete", json={
            "assignment_id": assignment_id,
            "student_username": "student1",
            "score": 8,
        })
        assert res.status_code == 200
