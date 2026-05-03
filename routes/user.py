from flask import Blueprint, render_template, redirect, url_for, request, flash
from flask_login import login_required, current_user
from models import db, Event, Booking, Favorite, Venue, Payment, User, bcrypt

user_bp = Blueprint('user', __name__)

@user_bp.route('/dashboard')
@login_required
def dashboard():
    if current_user.role == 'admin':
        return redirect(url_for('admin.dashboard'))
        
    events = Event.query.filter_by(user_id=current_user.id).order_by(Event.date).all()
    bookings = Booking.query.filter_by(user_id=current_user.id).all()
    favorites = Favorite.query.filter_by(user_id=current_user.id).all()
    
    total_spent = sum(payment.amount for booking in bookings for payment in [booking.payment] if payment and payment.status == 'completed')
    
    # Upcoming events count
    upcoming_events = [e for e in events if e.status == 'upcoming']
    
    # Recommended venues
    recommended_venues = Venue.query.order_by(db.func.random()).limit(3).all() if db.engine.name == 'sqlite' else Venue.query.limit(3).all()
    
    return render_template('dashboard/user.html', 
                           user_events=events, 
                           bookings=bookings, 
                           favorites=favorites,
                           total_spent=total_spent,
                           upcoming_count=len(upcoming_events),
                           recommended_venues=recommended_venues)

@user_bp.route('/settings', methods=['GET', 'POST'])
@login_required
def settings():
    if request.method == 'POST':
        name = request.form.get('name')
        new_password = request.form.get('new_password')
        confirm_password = request.form.get('confirm_password')
        
        user = User.query.get(current_user.id)
        
        if name:
            user.name = name
            
        if new_password:
            if new_password == confirm_password:
                user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
            else:
                flash('Passwords do not match.', 'danger')
                return redirect(url_for('user.settings'))
                
        db.session.commit()
        flash('Profile updated successfully!', 'success')
        return redirect(url_for('user.settings'))
        
    return render_template('user/settings.html')

@user_bp.route('/favorite/<int:venue_id>', methods=['POST'])
@login_required
def toggle_favorite(venue_id):
    favorite = Favorite.query.filter_by(user_id=current_user.id, venue_id=venue_id).first()
    
    if favorite:
        db.session.delete(favorite)
        db.session.commit()
        # Returning back to previous page
        return redirect(request.referrer or url_for('venue.list'))
    else:
        new_fav = Favorite(user_id=current_user.id, venue_id=venue_id)
        db.session.add(new_fav)
        db.session.commit()
        return redirect(request.referrer or url_for('venue.list'))
