from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

class Driver(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    license_number = models.CharField(max_length=50, unique=True)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.license_number}"

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
        ('flatbed', 'Flatbed'),
        ('box', 'Box'),
        ('refrigerated', 'Refrigerated'),
        ('tanker', 'Tanker'),
        ('other', 'Other'),
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
        ('planning', 'Planning'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='trips_as_driver')
    co_driver = models.ForeignKey(Driver, on_delete=models.SET_NULL, null=True, blank=True, related_name='trips_as_co_driver')
    truck = models.ForeignKey(Truck, on_delete=models.CASCADE)
    trailer = models.ForeignKey(Trailer, on_delete=models.CASCADE)
    
    current_cycle_hours = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(70)])
    status = models.CharField(max_length=20, choices=TRIP_STATUS, default='planning')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Trip {self.id} - {self.driver}"

class Stop(models.Model):
    STOP_TYPES = [
        ('pickup', 'Pickup'),
        ('dropoff', 'Dropoff'),
    ]
    
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='stops')
    stop_type = models.CharField(max_length=10, choices=STOP_TYPES)
    sequence = models.IntegerField()
    address = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    expected_time = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sequence']
        unique_together = ['trip', 'sequence']

    def __str__(self):
        return f"{self.trip} - {self.get_stop_type_display()} #{self.sequence}"

class TripLog(models.Model):
    LOG_TYPES = [
        ('start_trip', 'Start Trip'),
        ('stop_trip', 'Stop Trip'),
        ('fueling', 'Fueling'),
        ('rest_break', 'Rest Break'),
        ('pickup', 'Pickup'),
        ('dropoff', 'Dropoff'),
        ('driving_start', 'Driving Start'),
        ('driving_stop', 'Driving Stop'),
        ('inspection', 'Inspection'),
        ('other', 'Other'),
    ]
    
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='logs')
    stop = models.ForeignKey(Stop, on_delete=models.SET_NULL, null=True, blank=True, related_name='logs')
    log_type = models.CharField(max_length=20, choices=LOG_TYPES)
    
    # Location fields (can be different from stop location for activities like fueling)
    location_address = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    timestamp = models.DateTimeField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.trip} - {self.get_log_type_display()} at {self.timestamp}"
