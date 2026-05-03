from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from models import db, Booking, Event, Venue, Payment

booking_bp = Blueprint('booking', __name__)

@booking_bp.route('/create/<int:venue_id>', methods=['GET', 'POST'])
@login_required
def create(venue_id):
    venue = Venue.query.get_or_404(venue_id)
    events = Event.query.filter_by(user_id=current_user.id, status='upcoming').all()
    
    if request.method == 'POST':
        event_id = request.form.get('event_id')
        if not event_id:
            flash('Please select an event to book this venue.', 'warning')
            return redirect(url_for('booking.create', venue_id=venue_id))
            
        new_booking = Booking(
            user_id=current_user.id,
            event_id=event_id,
            venue_id=venue_id,
            status='pending'
        )
        db.session.add(new_booking)
        db.session.commit()
        
        # Simulate payment step
        return redirect(url_for('booking.payment', booking_id=new_booking.id))
        
    return render_template('bookings/create.html', venue=venue, user_events=events)

@booking_bp.route('/payment/<int:booking_id>', methods=['GET', 'POST'])
@login_required
def payment(booking_id):
    booking = Booking.query.get_or_404(booking_id)
    if booking.user_id != current_user.id:
        return redirect(url_for('user.dashboard'))
        
    if request.method == 'POST':
        # Simulate successful payment
        new_payment = Payment(
            booking_id=booking.id,
            amount=booking.venue.price,
            status='completed'
        )
        booking.status = 'confirmed'
        db.session.add(new_payment)
        db.session.commit()
        
        flash('Booking confirmed! Payment successful.', 'success')
        return redirect(url_for('user.dashboard'))
        
    return render_template('bookings/payment.html', booking=booking)

@booking_bp.route('/<int:booking_id>/cancel', methods=['POST'])
@login_required
def cancel(booking_id):
    booking = Booking.query.get_or_404(booking_id)
    if booking.user_id != current_user.id:
        flash('Unauthorized action.', 'danger')
        return redirect(url_for('user.dashboard'))
        
    if booking.status != 'pending':
        flash('Only pending bookings can be cancelled.', 'danger')
        return redirect(url_for('user.dashboard'))
        
    booking.status = 'cancelled'
    db.session.commit()
    flash('Booking cancelled successfully.', 'success')
    return redirect(url_for('user.dashboard'))
