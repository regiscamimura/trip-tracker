from ninja import NinjaAPI
from ninja.orm import create_schema
from django.shortcuts import get_object_or_404
from typing import List
from .models import Trip

# Create API instance
api = NinjaAPI()

# Auto-generate schema from model
TripSchema = create_schema(Trip)

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