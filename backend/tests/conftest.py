"""
conftest.py — Shared test fixtures for BioTrack API tests.

Uses an in-memory SQLite database so tests don't touch the real MySQL DB.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Import the app and DB pieces from main
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from main import app, Base, get_db, hash_password, UserModel, AnimalModel, QuestionModel, BadgeModel


# ── Test database setup ────────────────────────────────────────────────────────
TEST_DATABASE_URL = "sqlite://"  # in-memory

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Override the DB dependency so the app uses our test DB
app.dependency_overrides[get_db] = override_get_db


# ── Fixtures ───────────────────────────────────────────────────────────────────

@pytest.fixture(autouse=True)
def setup_database():
    """Create all tables before each test, drop them after."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def client():
    """FastAPI test client."""
    return TestClient(app)


@pytest.fixture
def db():
    """Direct database session for seeding test data."""
    session = TestSessionLocal()
    yield session
    session.close()


@pytest.fixture
def seed_admin(db):
    """Seed an admin user for tests that need one."""
    admin = UserModel(
        username="admin",
        password=hash_password("admin123"),
        role="admin",
        favorites=[], discovered=[], badges=[], quiz_scores={},
        must_reset_password=0,
    )
    db.add(admin)
    db.commit()
    return admin


@pytest.fixture
def seed_teacher(db):
    """Seed a teacher user."""
    teacher = UserModel(
        username="teacher1",
        password=hash_password("teach123"),
        role="teacher",
        favorites=[], discovered=[], badges=[], quiz_scores={},
    )
    db.add(teacher)
    db.commit()
    return teacher


@pytest.fixture
def seed_student(db):
    """Seed a student user."""
    student = UserModel(
        username="student1",
        password=hash_password("pass123"),
        role="student",
        favorites=[], discovered=[], badges=[], quiz_scores={},
    )
    db.add(student)
    db.commit()
    return student


@pytest.fixture
def seed_animal(db):
    """Seed a sample animal with questions."""
    animal_data = {
        "id": 1,
        "commonName": "Test Animal",
        "scientificName": "Testus animalus",
        "category": "Mammal",
        "conservationStatus": "Least Concern",
        "habitat": "Forest",
        "region": "North America",
        "diet": "Omnivore",
        "lifespan": "10 years",
        "weight": "5 kg",
        "height": "30 cm",
        "population": "~10,000",
        "description": "A test animal for unit testing.",
        "funFacts": ["Fact 1", "Fact 2"],
        "imageKey": "",
    }
    db.add(AnimalModel(id=1, data=animal_data))

    questions = [
        {"question": f"Test question {i+1}?", "options": ["A", "B", "C", "D"], "answer": 0}
        for i in range(8)
    ]
    db.add(QuestionModel(animal_id=1, data=questions))
    db.commit()
    return animal_data
