from django.contrib import admin
from .models import Driver, Truck, Trailer, Trip, Stop, TripLog

@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ['user', 'license_number', 'phone', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'user__first_name', 'user__last_name', 'license_number', 'phone']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Truck)
class TruckAdmin(admin.ModelAdmin):
    list_display = ['truck_number', 'make_model', 'year', 'license_plate', 'created_at']
    list_filter = ['year', 'created_at']
    search_fields = ['truck_number', 'make_model', 'license_plate']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Trailer)
class TrailerAdmin(admin.ModelAdmin):
    list_display = ['trailer_number', 'trailer_type', 'capacity', 'created_at']
    list_filter = ['trailer_type', 'created_at']
    search_fields = ['trailer_number', 'capacity']
    readonly_fields = ['created_at', 'updated_at']

class StopInline(admin.TabularInline):
    model = Stop
    extra = 1
    fields = ['stop_type', 'sequence', 'address', 'expected_time']

class TripLogInline(admin.TabularInline):
    model = TripLog
    extra = 1
    fields = ['log_type', 'location_address', 'timestamp', 'notes']
    readonly_fields = ['created_at']

@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ['id', 'driver', 'co_driver', 'truck', 'trailer', 'status', 'created_at']
    list_filter = ['status', 'created_at', 'truck', 'trailer']
    search_fields = ['driver__user__username', 'co_driver__user__username', 'truck__truck_number', 'trailer__trailer_number']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [StopInline, TripLogInline]
    fieldsets = (
        ('Trip Information', {
            'fields': ('driver', 'co_driver', 'truck', 'trailer', 'status')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Stop)
class StopAdmin(admin.ModelAdmin):
    list_display = ['trip', 'stop_type', 'sequence', 'address', 'expected_time']
    list_filter = ['stop_type', 'expected_time', 'created_at']
    search_fields = ['trip__driver__user__username', 'address']
    readonly_fields = ['created_at']
    ordering = ['trip', 'sequence']

@admin.register(TripLog)
class TripLogAdmin(admin.ModelAdmin):
    list_display = ['trip', 'log_type', 'location_address', 'timestamp', 'stop']
    list_filter = ['log_type', 'timestamp', 'created_at']
    search_fields = ['trip__driver__user__username', 'location_address', 'notes']
    readonly_fields = ['created_at']
    ordering = ['trip', 'timestamp']
