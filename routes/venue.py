from flask import Blueprint, render_template, request, jsonify
from models import db, Venue, VenueImage, Review

venue_bp = Blueprint('venue', __name__)

@venue_bp.route('/')
def list():
    location = request.args.get('location', '')
    price_range = request.args.get('price_range')
    capacity_range = request.args.get('capacity_range')
    
    query = Venue.query
    
    if location:
        query = query.filter(Venue.location.ilike(f'%{location}%'))
        
    if price_range:
        try:
            min_p, max_p = map(float, price_range.split('-'))
            query = query.filter(Venue.price >= min_p)
            if max_p < 999999:
                query = query.filter(Venue.price <= max_p)
        except ValueError:
            pass

    if capacity_range:
        try:
            min_c, max_c = map(int, capacity_range.split('-'))
            query = query.filter(Venue.capacity >= min_c)
            if max_c < 999999:
                query = query.filter(Venue.capacity <= max_c)
        except ValueError:
            pass
            
    venues = query.all()
    
    return render_template('venues/list.html', venues=venues)

@venue_bp.route('/<int:venue_id>')
def detail(venue_id):
    venue = Venue.query.get_or_404(venue_id)
    return render_template('venues/detail.html', venue=venue)
