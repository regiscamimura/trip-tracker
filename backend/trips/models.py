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
        driving_logs = DutyStatus.objects.filter(
            daily_log__driver=self,
            duty_status="driving",
            timestamp__gte=eight_days_ago,
        ).order_by("timestamp")

        total_hours = 0
        driving_start_time = None

        for log in driving_logs:
            if driving_start_time is None:
                driving_start_time = log.timestamp
            else:
                # Calculate hours between start and this log entry
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


class DailyLog(models.Model):
    LOG_STATUS = [
        ("planning", "Planning"),
        ("active", "Active"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    driver = models.ForeignKey(
        Driver, on_delete=models.CASCADE, related_name="daily_logs_as_driver"
    )
    co_driver = models.ForeignKey(
        Driver,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="daily_logs_as_co_driver",
    )
    truck = models.ForeignKey(Truck, on_delete=models.CASCADE)
    trailer = models.ForeignKey(Trailer, on_delete=models.CASCADE)

    status = models.CharField(max_length=20, choices=LOG_STATUS, default="planning")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Daily Log {self.id} - {self.driver}"


class DutyStatus(models.Model):
    DUTY_STATUSES = [
        ("off_duty", "Off Duty"),
        ("sleeper_berth", "Sleeper Berth"),
        ("driving", "Driving"),
        ("on_duty", "On Duty"),
    ]

    daily_log = models.ForeignKey(DailyLog, on_delete=models.CASCADE, related_name="duty_statuses")
    duty_status = models.CharField(max_length=20, choices=DUTY_STATUSES)
    
    # Location fields for where the status change occurred
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
        return f"{self.daily_log} - {self.get_duty_status_display()} at {self.timestamp}"
