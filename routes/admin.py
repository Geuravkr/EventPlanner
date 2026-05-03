from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from models import db, User, Venue, Event, Booking, Payment, VenueImage

admin_bp = Blueprint('admin', __name__)

@admin_bp.before_request
@login_required
def require_admin():
    if current_user.role != 'admin':
        flash('You do not have permission to access this page.', 'danger')
        return redirect(url_for('user.dashboard'))

@admin_bp.route('/dashboard')
def dashboard():
    total_users = User.query.count()
    total_venues = Venue.query.count()
    total_events = Event.query.count()
    total_bookings = Booking.query.count()
    
    # Calculate revenue
    payments = Payment.query.filter_by(status='completed').all()
    total_revenue = sum(p.amount for p in payments)
    
    # Prepare chart data (Dictionary format for frontend)
    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    events_data = {month: 0 for month in month_names}
    
    for e in Event.query.all():
        if e.date:
            events_data[month_names[e.date.month - 1]] += 1
            
    recent_venues = Venue.query.order_by(Venue.created_at.desc()).limit(5).all()
            
    return render_template('dashboard/admin.html',
                           total_users=total_users,
                           total_venues=total_venues,
                           total_events=total_events,
                           total_bookings=total_bookings,
                           total_revenue=total_revenue,
                           events_data=events_data,
                           recent_venues=recent_venues)

@admin_bp.route('/venues')
def manage_venues():
    venues = Venue.query.order_by(Venue.created_at.desc()).all()
    return render_template('admin/venues.html', venues=venues)

@admin_bp.route('/venues/add', methods=['GET', 'POST'])
def add_venue():
    if request.method == 'POST':
        name = request.form.get('name')
        location = request.form.get('location')
        price = request.form.get('price', type=float)
        capacity = request.form.get('capacity', type=int)
        description = request.form.get('description')
        image_url = request.form.get('image_url')
        
        new_venue = Venue(
            name=name,
            location=location,
            price=price,
            capacity=capacity,
            description=description,
            rating=5.0  # Default rating for new venues
        )
        db.session.add(new_venue)
        db.session.flush() # Get the new venue ID
        
        if image_url:
            venue_image = VenueImage(venue_id=new_venue.id, image_url=image_url)
            db.session.add(venue_image)
            
        db.session.commit()
        flash(f'Venue "{name}" added successfully!', 'success')
        return redirect(url_for('admin.manage_venues'))
        
    return render_template('admin/add_venue.html')

@admin_bp.route('/venues/<int:id>/delete', methods=['POST'])
def delete_venue(id):
    venue = Venue.query.get_or_404(id)
    db.session.delete(venue)
    db.session.commit()
    flash('Venue deleted successfully.', 'success')
    return redirect(url_for('admin.manage_venues'))

@admin_bp.route('/bookings')
def manage_bookings():
    bookings = Booking.query.order_by(Booking.created_at.desc()).all()
    return render_template('admin/bookings.html', bookings=bookings)

@admin_bp.route('/bookings/<int:id>/update_status', methods=['POST'])
def update_booking_status(id):
    booking = Booking.query.get_or_404(id)
    new_status = request.form.get('status')
    
    if new_status in ['pending', 'confirmed', 'cancelled']:
        booking.status = new_status
        db.session.commit()
        flash(f'Booking #{booking.id} status updated to {new_status}.', 'success')
    else:
        flash('Invalid status.', 'danger')
        
    return redirect(url_for('admin.manage_bookings'))
