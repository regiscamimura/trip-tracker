from typing import List

from django.contrib.auth import authenticate
from django.contrib.auth import logout as django_logout
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from ninja import NinjaAPI, Schema
from ninja.orm import create_schema

from .models import Driver, DailyLog, Truck, Trailer, DutyStatus

# Create API instance
api = NinjaAPI()

@api.get("/")
def api_root(request):
    """API root endpoint for health checks"""
    return {"message": "Trip Tracker API is running", "status": "ok"}

# Auto-generate schema from model
DailyLogSchema = create_schema(DailyLog, depth=2, exclude=["co_driver"])
DailyLogCreateSchema = create_schema(DailyLog, exclude=["id", "created_at", "updated_at"])
UserSchema = create_schema(User, exclude=["password", "groups", "user_permissions"])
DriverSchema = create_schema(Driver, depth=2)
TruckSchema = create_schema(Truck)
TrailerSchema = create_schema(Trailer)
DutyStatusSchema = create_schema(DutyStatus)
DutyStatusCreateSchema = create_schema(DutyStatus, exclude=["id", "created_at", "daily_log"])


class DailyLogCreateInput(Schema):
    driver_id: int
    truck_id: int
    trailer_id: int
    co_driver_id: int | None = None
    status: str = "planning"

class DutyStatusCreateInput(Schema):
    duty_status: str
    location_address: str
    latitude: float | None = None
    longitude: float | None = None
    timestamp: str
    notes: str | None = None


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


@api.post("/logout")
def logout(request):
    """Log out the current user (session-based)"""
    django_logout(request)
    return {"success": True, "message": "Logged out successfully"}


@api.get("/daily-logs", response=List[DailyLogSchema])
def list_daily_logs(request):
    """Get all daily logs"""
    return DailyLog.objects.all().order_by('-created_at')


@api.get("/daily-logs/{daily_log_id}", response=DailyLogSchema)
def get_daily_log(request, daily_log_id: int):
    """Get a specific daily log by ID"""
    return get_object_or_404(DailyLog, id=daily_log_id)


@api.post("/daily-logs", response=DailyLogSchema)
def create_daily_log(request, payload: DailyLogCreateInput):
    """Create a new daily log"""
    driver = get_object_or_404(Driver, id=payload.driver_id)
    truck = get_object_or_404(Truck, id=payload.truck_id)
    trailer = get_object_or_404(Trailer, id=payload.trailer_id)
    
    co_driver = None
    if payload.co_driver_id:
        co_driver = get_object_or_404(Driver, id=payload.co_driver_id)
    
    daily_log = DailyLog.objects.create(
        driver=driver,
        truck=truck,
        trailer=trailer,
        co_driver=co_driver,
        status=payload.status
    )
    return daily_log


@api.put("/daily-logs/{daily_log_id}", response=DailyLogSchema)
def update_daily_log(request, daily_log_id: int, payload: DailyLogSchema):
    """Update a daily log"""
    daily_log = get_object_or_404(DailyLog, id=daily_log_id)
    for attr, value in payload.dict(exclude_unset=True).items():
        setattr(daily_log, attr, value)
    daily_log.save()
    return daily_log


@api.delete("/daily-logs/{daily_log_id}")
def delete_daily_log(request, daily_log_id: int):
    """Delete a daily log"""
    daily_log = get_object_or_404(DailyLog, id=daily_log_id)
    daily_log.delete()
    return {"success": True}


# DutyStatus endpoints
@api.get("/daily-logs/{daily_log_id}/duty-statuses", response=List[DutyStatusSchema])
def list_duty_statuses(request, daily_log_id: int):
    """Get all duty statuses for a daily log"""
    daily_log = get_object_or_404(DailyLog, id=daily_log_id)
    return daily_log.duty_statuses.all()


@api.post("/daily-logs/{daily_log_id}/duty-statuses", response=DutyStatusSchema)
def create_duty_status(request, daily_log_id: int, payload: DutyStatusCreateInput):
    """Create a new duty status for a daily log"""
    daily_log = get_object_or_404(DailyLog, id=daily_log_id)
    
    duty_status = DutyStatus.objects.create(
        daily_log=daily_log,
        duty_status=payload.duty_status,
        location_address=payload.location_address,
        latitude=payload.latitude,
        longitude=payload.longitude,
        timestamp=payload.timestamp,
        notes=payload.notes
    )
    return duty_status


@api.get("/duty-statuses/{duty_status_id}", response=DutyStatusSchema)
def get_duty_status(request, duty_status_id: int):
    """Get a specific duty status by ID"""
    return get_object_or_404(DutyStatus, id=duty_status_id)


@api.put("/duty-statuses/{duty_status_id}", response=DutyStatusSchema)
def update_duty_status(request, duty_status_id: int, payload: DutyStatusSchema):
    """Update a duty status"""
    duty_status = get_object_or_404(DutyStatus, id=duty_status_id)
    for attr, value in payload.dict(exclude_unset=True).items():
        setattr(duty_status, attr, value)
    duty_status.save()
    return duty_status


@api.delete("/duty-statuses/{duty_status_id}")
def delete_duty_status(request, duty_status_id: int):
    """Delete a duty status"""
    duty_status = get_object_or_404(DutyStatus, id=duty_status_id)
    duty_status.delete()
    return {"success": True}
