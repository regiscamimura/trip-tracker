from django.contrib.auth.models import User
from django.db import models


class Driver(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    license_number = models.CharField(max_length=50, unique=True)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.license_number}"

    def get_current_cycle_hours(self):
        """Calculate current cycle hours from TripLog entries in the last 8 days"""
        from datetime import timedelta

        from django.utils import timezone

        # Get logs from last 8 days
        eight_days_ago = timezone.now() - timedelta(days=8)

        # Get all driving logs for this driver
        driving_logs = TripLog.objects.filter(
            trip__driver=self,
            log_type__in=["driving_start", "driving_stop"],
            timestamp__gte=eight_days_ago,
        ).order_by("timestamp")

        total_hours = 0
        driving_start_time = None

        for log in driving_logs:
            if log.log_type == "driving_start":
                driving_start_time = log.timestamp
            elif log.log_type == "driving_stop" and driving_start_time:
                # Calculate hours between start and stop
                duration = log.timestamp - driving_start_time
                total_hours += duration.total_seconds() / 3600  # Convert to hours
                driving_start_time = None

        return round(total_hours, 2)

    def get_remaining_hours(self):
        """Get remaining hours (70 - current_cycle_hours)"""
        return max(0, 70 - self.get_current_cycle_hours())


class Truck(models.Model):
    truck_number = models.CharField(max_length=20, unique=True)
    make_model = models.CharField(max_length=100)
    year = models.IntegerField()
    license_plate = models.CharField(max_length=20, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.truck_number} - {self.make_model} ({self.year})"


class Trailer(models.Model):
    TRAILER_TYPES = [
        ("flatbed", "Flatbed"),
        ("box", "Box"),
        ("refrigerated", "Refrigerated"),
        ("tanker", "Tanker"),
        ("other", "Other"),
    ]

    trailer_number = models.CharField(max_length=20, unique=True)
    trailer_type = models.CharField(max_length=20, choices=TRAILER_TYPES)
    capacity = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.trailer_number} - {self.get_trailer_type_display()}"


class Trip(models.Model):
    TRIP_STATUS = [
        ("planning", "Planning"),
        ("active", "Active"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    driver = models.ForeignKey(
        Driver, on_delete=models.CASCADE, related_name="trips_as_driver"
    )
    co_driver = models.ForeignKey(
        Driver,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="trips_as_co_driver",
    )
    truck = models.ForeignKey(Truck, on_delete=models.CASCADE)
    trailer = models.ForeignKey(Trailer, on_delete=models.CASCADE)

    status = models.CharField(max_length=20, choices=TRIP_STATUS, default="planning")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Trip {self.id} - {self.driver}"


class Stop(models.Model):
    STOP_TYPES = [
        ("pickup", "Pickup"),
        ("dropoff", "Dropoff"),
    ]

    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name="stops")
    stop_type = models.CharField(max_length=10, choices=STOP_TYPES)
    sequence = models.IntegerField()
    address = models.TextField()
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    expected_time = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sequence"]
        unique_together = ["trip", "sequence"]

    def __str__(self):
        return f"{self.trip} - {self.get_stop_type_display()} #{self.sequence}"


class TripLog(models.Model):
    LOG_TYPES = [
        ("start_trip", "Start Trip"),
        ("stop_trip", "Stop Trip"),
        ("fueling", "Fueling"),
        ("rest_break", "Rest Break"),
        ("pickup", "Pickup"),
        ("dropoff", "Dropoff"),
        ("driving_start", "Driving Start"),
        ("driving_stop", "Driving Stop"),
        ("inspection", "Inspection"),
        ("other", "Other"),
    ]

    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name="logs")
    stop = models.ForeignKey(
        Stop, on_delete=models.SET_NULL, null=True, blank=True, related_name="logs"
    )
    log_type = models.CharField(max_length=20, choices=LOG_TYPES)

    # Location fields (can be different from stop location for activities like fueling)
    location_address = models.TextField()
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )

    timestamp = models.DateTimeField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["timestamp"]

    def __str__(self):
        return f"{self.trip} - {self.get_log_type_display()} at {self.timestamp}"
