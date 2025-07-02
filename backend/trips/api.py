from typing import List

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from ninja import NinjaAPI, Schema
from ninja.orm import create_schema

from .models import Driver, Trip

# Create API instance
api = NinjaAPI()

# Auto-generate schema from model
TripSchema = create_schema(Trip)
UserSchema = create_schema(User, exclude=["password", "groups", "user_permissions"])
DriverSchema = create_schema(Driver, exclude=["user"])


# Login schema
class LoginSchema(Schema):
    username: str
    password: str


# Login response schema
class LoginResponseSchema(Schema):
    success: bool
    user: UserSchema | None = None
    driver: DriverSchema | None = None
    message: str = None


@api.post("/login", response=LoginResponseSchema)
def login(request, payload: LoginSchema):
    """Authenticate user and return user data"""
    user = authenticate(username=payload.username, password=payload.password)

    if user is not None:
        # Get driver data if it exists
        try:
            driver = Driver.objects.get(user=user)
        except Driver.DoesNotExist:
            driver = None

        return {
            "success": True,
            "user": user,
            "driver": driver,
            "message": "Login successful",
        }
    else:
        return {
            "success": False,
            "user": None,
            "driver": None,
            "message": "Invalid credentials",
        }


@api.get("/trips", response=List[TripSchema])
def list_trips(request):
    """Get all trips"""
    return Trip.objects.all()


@api.get("/trips/{trip_id}", response=TripSchema)
def get_trip(request, trip_id: int):
    """Get a specific trip by ID"""
    return get_object_or_404(Trip, id=trip_id)


@api.post("/trips", response=TripSchema)
def create_trip(request, payload):
    """Create a new trip"""
    trip_data = payload.dict()
    trip = Trip.objects.create(**trip_data)
    return trip


@api.put("/trips/{trip_id}", response=TripSchema)
def update_trip(request, trip_id: int, payload):
    """Update a trip"""
    trip = get_object_or_404(Trip, id=trip_id)
    for attr, value in payload.dict(exclude_unset=True).items():
        setattr(trip, attr, value)
    trip.save()
    return trip


@api.delete("/trips/{trip_id}")
def delete_trip(request, trip_id: int):
    """Delete a trip"""
    trip = get_object_or_404(Trip, id=trip_id)
    trip.delete()
    return {"success": True}
