import os
from dotenv import load_dotenv
from app import app
from models import db, User, Venue, VenueImage, bcrypt

load_dotenv()

def init_db():
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Check if admin exists
        admin = User.query.filter_by(email='admin@eventful.com').first()
        if not admin:
            hashed_password = bcrypt.generate_password_hash('admin123').decode('utf-8')
            admin = User(name='Admin User', email='admin@eventful.com', password=hashed_password, role='admin')
            db.session.add(admin)
            print("Admin user created.")

        # Add some sample venues if none exist
        if Venue.query.count() == 0:
            venues = [
                Venue(name="Grand Crystal Ballroom", location="New York, NY", price=5000.0, capacity=300, description="An elegant ballroom perfect for weddings and corporate galas. Features crystal chandeliers and a grand staircase.", rating=4.9),
                Venue(name="Seaside Garden", location="Malibu, CA", price=3500.0, capacity=150, description="Beautiful outdoor garden with unobstructed ocean views. Perfect for sunset ceremonies.", rating=4.8),
                Venue(name="Urban Loft Space", location="Chicago, IL", price=2000.0, capacity=80, description="Modern industrial loft for intimate parties, workshops, and art exhibitions.", rating=4.6),
                Venue(name="The Glasshouse Retreat", location="Austin, TX", price=2800.0, capacity=120, description="A stunning architectural masterpiece made entirely of glass, set amidst a lush forest. Ideal for creative retreats.", rating=4.9),
                Venue(name="Historic Manor Estate", location="Charleston, SC", price=6500.0, capacity=400, description="Step back in time in this 18th-century manor. Features sweeping lawns, ancient oaks, and classic southern charm.", rating=4.7),
                Venue(name="Skyline Penthouse", location="Miami, FL", price=4200.0, capacity=60, description="Exclusive rooftop penthouse with a wrap-around terrace and infinity pool overlooking the city skyline.", rating=4.8),
                Venue(name="Rustic Vineyard Barn", location="Napa Valley, CA", price=5500.0, capacity=250, description="A beautifully restored barn set in the heart of wine country. Features exposed wood beams and fairy lights.", rating=4.9),
                Venue(name="Desert Oasis Pavilion", location="Scottsdale, AZ", price=3100.0, capacity=200, description="Open-air pavilion surrounded by breathtaking desert landscapes and cacti. Perfect for evening stargazing events.", rating=4.5),
                Venue(name="Alpine Mountain Lodge", location="Aspen, CO", price=7000.0, capacity=180, description="Luxury ski-in/ski-out lodge with massive stone fireplaces, vaulted ceilings, and panoramic mountain views.", rating=4.8),
                Venue(name="The Art Deco Theatre", location="Los Angeles, CA", price=4800.0, capacity=500, description="A fully restored 1920s theatre with a grand stage, velvet seating, and state-of-the-art audiovisual capabilities.", rating=4.7),
                Venue(name="Lakeside Glass Pavilion", location="Lake Tahoe, NV", price=3800.0, capacity=100, description="A contemporary space floating on the edge of the lake with floor-to-ceiling windows.", rating=4.9),
                Venue(name="Botanical Conservatory", location="Seattle, WA", price=2500.0, capacity=120, description="A lush, tropical indoor garden under a spectacular glass dome.", rating=4.6)
            ]
            db.session.add_all(venues)
            db.session.commit()
            
            # Add images for venues
            images = [
                # Grand Crystal Ballroom
                VenueImage(venue_id=venues[0].id, image_url="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1000&auto=format&fit=crop"),
                VenueImage(venue_id=venues[0].id, image_url="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000&auto=format&fit=crop"),
                # Seaside Garden
                VenueImage(venue_id=venues[1].id, image_url="https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=1000&auto=format&fit=crop"),
                VenueImage(venue_id=venues[1].id, image_url="https://images.unsplash.com/photo-1530103862676-de8892bf309c?q=80&w=1000&auto=format&fit=crop"),
                # Urban Loft Space
                VenueImage(venue_id=venues[2].id, image_url="https://images.unsplash.com/photo-1519750783826-e2420f4d687f?q=80&w=1000&auto=format&fit=crop"),
                VenueImage(venue_id=venues[2].id, image_url="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop"),
                # The Glasshouse Retreat
                VenueImage(venue_id=venues[3].id, image_url="https://images.unsplash.com/photo-1510627489930-0c1b0bfb6785?q=80&w=1000&auto=format&fit=crop"),
                # Historic Manor Estate
                VenueImage(venue_id=venues[4].id, image_url="https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?q=80&w=1000&auto=format&fit=crop"),
                # Skyline Penthouse
                VenueImage(venue_id=venues[5].id, image_url="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop"),
                # Rustic Vineyard Barn
                VenueImage(venue_id=venues[6].id, image_url="https://images.unsplash.com/photo-1505944270255-72b8c68c6a70?q=80&w=1000&auto=format&fit=crop"),
                # Desert Oasis Pavilion
                VenueImage(venue_id=venues[7].id, image_url="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1000&auto=format&fit=crop"),
                # Alpine Mountain Lodge
                VenueImage(venue_id=venues[8].id, image_url="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000&auto=format&fit=crop"),
                # The Art Deco Theatre
                VenueImage(venue_id=venues[9].id, image_url="https://images.unsplash.com/photo-1507676184212-d0330a156f97?q=80&w=1000&auto=format&fit=crop"),
                # Lakeside Glass Pavilion
                VenueImage(venue_id=venues[10].id, image_url="https://images.unsplash.com/photo-1473116763249-2faaef81ccda?q=80&w=1000&auto=format&fit=crop"),
                # Botanical Conservatory
                VenueImage(venue_id=venues[11].id, image_url="https://images.unsplash.com/photo-1533555239928-8ce786a5b2e9?q=80&w=1000&auto=format&fit=crop")
            ]
            db.session.add_all(images)
            print("12 Premium sample venues created.")

        db.session.commit()
        print("Database initialization complete.")

if __name__ == '__main__':
    init_db()
