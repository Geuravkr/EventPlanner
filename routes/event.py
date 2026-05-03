from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from models import db, Event
from datetime import datetime

event_bp = Blueprint('event', __name__)

@event_bp.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    if request.method == 'POST':
        name = request.form.get('name')
        date_str = request.form.get('date')
        guests = request.form.get('guests', type=int)
        budget = request.form.get('budget', type=float)
        event_type = request.form.get('type')
        
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        
        new_event = Event(
            user_id=current_user.id,
            name=name,
            date=date_obj,
            guests=guests,
            budget=budget,
            type=event_type,
            status='upcoming'
        )
        db.session.add(new_event)
        db.session.commit()
        
        flash('Event created successfully!', 'success')
        return redirect(url_for('user.dashboard'))
        
    return render_template('events/manage.html')

@event_bp.route('/<int:event_id>/delete', methods=['POST'])
@login_required
def delete(event_id):
    event = Event.query.get_or_404(event_id)
    if event.user_id != current_user.id:
        flash('Unauthorized action.', 'danger')
        return redirect(url_for('user.dashboard'))
        
    db.session.delete(event)
    db.session.commit()
    flash('Event deleted successfully.', 'success')
    return redirect(url_for('user.dashboard'))
