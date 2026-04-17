"""
test_animals.py — Tests for animal browsing, quiz submission, and favorites.

Author: Ethan Irimiciu
"""

import pytest


class TestAnimalEndpoints:
    """Tests for GET /api/animals and GET /api/animals/{id}"""

    def test_get_all_animals(self, client, seed_animal):
        """Should return all animals as a dictionary."""
        res = client.get("/api/animals")
        assert res.status_code == 200
        data = res.json()
        assert "1" in data
        assert data["1"]["commonName"] == "Test Animal"

    def test_get_single_animal(self, client, seed_animal):
        """Should return a single animal by ID."""
        res = client.get("/api/animals/1")
        assert res.status_code == 200
        assert res.json()["commonName"] == "Test Animal"
        assert res.json()["scientificName"] == "Testus animalus"

    def test_get_nonexistent_animal(self, client):
        """Requesting an animal that doesn't exist should return 404."""
        res = client.get("/api/animals/999")
        assert res.status_code == 404

    def test_get_animal_has_expected_fields(self, client, seed_animal):
        """Animal data should contain all the required fields."""
        res = client.get("/api/animals/1")
        data = res.json()
        expected_fields = [
            "commonName", "scientificName", "category",
            "conservationStatus", "habitat", "region", "diet",
            "description",
        ]
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"


class TestQuestions:
    """Tests for question endpoints."""

    def test_get_all_questions(self, client, seed_animal):
        """Should return all questions grouped by animal ID."""
        res = client.get("/api/questions")
        assert res.status_code == 200
        data = res.json()
        assert "1" in data
        assert len(data["1"]) == 8

    def test_get_questions_for_animal(self, client, seed_animal):
        """Should return questions for a specific animal."""
        res = client.get("/api/questions/animal/1")
        assert res.status_code == 200
        data = res.json()
        assert len(data) == 1  # wrapped in a list
        assert len(data[0]) == 8

    def test_question_has_correct_structure(self, client, seed_animal):
        """Each question should have question text, 4 options, and an answer index."""
        res = client.get("/api/questions/animal/1")
        question = res.json()[0][0]
        assert "question" in question
        assert "options" in question
        assert "answer" in question
        assert len(question["options"]) == 4
        assert question["answer"] in [0, 1, 2, 3]

    def test_get_questions_nonexistent_animal(self, client):
        """Should return 404 for an animal with no questions."""
        res = client.get("/api/questions/animal/999")
        assert res.status_code == 404


class TestQuizSubmission:
    """Tests for POST /api/quiz/submit"""

    def test_submit_quiz(self, client, seed_student, seed_animal):
        """Submitting a quiz should update the student's score and points."""
        res = client.post("/api/quiz/submit?username=student1&animal_id=1&score=6")
        assert res.status_code == 200
        data = res.json()
        assert data["score"] == 6
        assert data["user"]["points"] > 0

    def test_submit_quiz_earns_first_quiz_badge(self, client, seed_student, seed_animal):
        """First quiz submission should earn the FIRST_QUIZ badge."""
        res = client.post("/api/quiz/submit?username=student1&animal_id=1&score=3")
        assert res.status_code == 200
        assert "FIRST_QUIZ" in res.json()["new_badges"]

    def test_submit_perfect_quiz(self, client, seed_student, seed_animal):
        """A perfect score should earn the PERFECT_QUIZ badge."""
        res = client.post("/api/quiz/submit?username=student1&animal_id=1&score=8")
        assert res.status_code == 200
        assert "PERFECT_QUIZ" in res.json()["new_badges"]

    def test_submit_quiz_adds_to_discovered(self, client, seed_student, seed_animal):
        """Taking a quiz should add the animal to the student's discoveries."""
        res = client.post("/api/quiz/submit?username=student1&animal_id=1&score=5")
        assert 1 in res.json()["user"]["discovered"]

    def test_submit_quiz_nonexistent_user(self, client, seed_animal):
        """Should return 404 for a user that doesn't exist."""
        res = client.post("/api/quiz/submit?username=nobody&animal_id=1&score=5")
        assert res.status_code == 404


class TestFavorites:
    """Tests for favorites endpoints."""

    def test_add_favorite(self, client, seed_student, seed_animal):
        """Adding a favorite should update the user's favorites list."""
        res = client.post(
            "/api/favorites/add?username=student1",
            json={"animal_id": 1},
        )
        assert res.status_code == 200
        assert 1 in res.json()["favorites"]

    def test_add_favorite_earns_badge(self, client, seed_student, seed_animal):
        """First favorite should earn FIRST_FAVORITE badge."""
        res = client.post(
            "/api/favorites/add?username=student1",
            json={"animal_id": 1},
        )
        assert "FIRST_FAVORITE" in res.json()["new_badges"]

    def test_remove_favorite(self, client, seed_student, seed_animal):
        """Removing a favorite should update the user's favorites list."""
        client.post("/api/favorites/add?username=student1", json={"animal_id": 1})
        res = client.post(
            "/api/favorites/remove?username=student1",
            json={"animal_id": 1},
        )
        assert res.status_code == 200
        assert 1 not in res.json()["favorites"]

    def test_add_duplicate_favorite(self, client, seed_student, seed_animal):
        """Adding the same favorite twice should not duplicate it."""
        client.post("/api/favorites/add?username=student1", json={"animal_id": 1})
        client.post("/api/favorites/add?username=student1", json={"animal_id": 1})
        res = client.get("/api/user/student1")
        assert res.json()["favorites"].count(1) == 1
