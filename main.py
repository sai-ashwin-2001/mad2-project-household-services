from flask import Flask, render_template , request, jsonify , current_app , session , make_response
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash
from datetime import datetime , date , timedelta
from sqlalchemy.exc import IntegrityError
from flask_restful import Resource, Api, reqparse, fields, marshal
from flask_security import auth_required, roles_required, current_user
from flask import jsonify
from sqlalchemy import func 
from flask import request
from jinja2 import Template
from celery import Celery, Task , shared_task
import jwt as pyjwt
import json
import sqlite3
import time
from flask_login import login_required
# import flask_excel as excel
from celery.schedules import crontab
from smtplib import SMTP
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import logging
from datetime import datetime, timedelta
import os
from sqlalchemy import func
from flask import Flask
from flask import Flask, render_template
from flask_caching import Cache
from flask_migrate import Migrate
from flask import current_app as app, jsonify, request, render_template, send_file
from flask_security import auth_required, roles_required
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename
from flask_restful import marshal, fields
from celery.result import AsyncResult
from flask_mail import Message
from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from flask import request
import csv
from celery import Celery
from datetime import datetime, timedelta
from flask_mail import Mail, Message
import pandas as pd
import matplotlib.pyplot as plt
import base64
from io import BytesIO
import pdfkit
import requests
from flask_sqlalchemy import SQLAlchemy
from flask_caching import Cache
from celery import Celery, shared_task
from celery.schedules import crontab
from smtplib import SMTP
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from datetime import date
from jinja2 import Template
import pdfkit
# from celery import Celery
# from celery_routes import celery_bp
#db = SQLAlchemy()


class Configs:
    """Base configuration class."""
    DEBUG = False
    TESTING = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    WTF_CSRF_ENABLED = False
    SECRET_KEY = "thisissecret"
    SECURITY_PASSWORD_SALT = "thisissalt"
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-Token'
    CACHE_TYPE = "RedisCache"
    CACHE_REDIS_HOST = "localhost"
    CACHE_REDIS_PORT = 6380
    CACHE_REDIS_DB = 3
    MAIL_SERVER = "smtp.gmail.com"
    # MAIL_PORT = 587
    # MAIL_USE_TLS = True
    # MAIL_USERNAME = "21f2000619@ds.study.iitm.ac.in"
    # MAIL_PASSWORD = "ehd3u7cp"
    MAIL_SERVER = "localhost"
    MAIL_PORT = 1025
    MAIL_USE_TLS = False
    MAIL_USERNAME = None
    MAIL_PASSWORD = None

    
    # Add Celery configuration keys
    CELERY_BROKER_URL = "redis://localhost:6380/0"
    CELERY_RESULT_BACKEND = "redis://localhost:6380/1"
    CELERY_TIMEZONE = "Asia/Kolkata"
    CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
    CELERY_INCLUDE = []
    ADMIN_EMAIL = 'admin@uc.com'

    UPLOAD_FOLDER = "static/uploads"
    ALLOWED_EXTENSIONS = {"pdf"}
    SMTP_HOST = "localhost"
    SMTP_PORT = 1025
    SENDER_EMAIL = "21f2000619@ds.study.iitm.ac.in"
    SENDER_PASSWORD = "ehd3u7cp"
    GOOGLE_CHAT_WEBHOOK = "https://chat.googleapis.com/v1/spaces/AAAA_zdVAP0/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=2Jy-elEmN1iUCm7Y-CbQNdAUUr95Bbjbei20sFb-JeQ"

class Configurations_Development(Configs):
    """Development-specific configuration."""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///household_services.db'


# Flask app initialization
app = Flask(__name__, template_folder='template')
app.config.from_object(Configurations_Development)


# Ensure the upload folder exists
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)


def allowed_file(filename):
    """Utility to check if the uploaded file is allowed."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in app.config["ALLOWED_EXTENSIONS"]


# Initialize Flask extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
cache = Cache(app)
mail = Mail(app)


# Celery initialization
def celery_init_app(app):
    celery = Celery(
        app.name,
        broker='redis://localhost:6379/1',
        backend='redis://localhost:6379/2'
    )
    celery.conf.update(app.config)
    return celery

celery_app = celery_init_app(app)

# Helper function to send emails
def send_message(to, subject, content_body):
    msg = MIMEMultipart()
    msg["To"] = to
    msg["Subject"] = subject
    msg["From"] = app.config['SENDER_EMAIL']
    msg.attach(MIMEText(content_body, 'html'))
    with SMTP(host=app.config['SMTP_HOST'], port=app.config['SMTP_PORT']) as client:
        client.send_message(msg=msg)



def send_to_google_chat(webhook_url, message):
    """Send a message to Google Chat via webhook."""
    headers = {'Content-Type': 'application/json'}
    payload = {"text": message}

    try:
        response = requests.post(webhook_url, json=payload, headers=headers)
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
        logging.info(f"Message sent to Google Chat: {message}")
    except requests.exceptions.RequestException as e:
        logging.error(f"Failed to send message to Google Chat: {e}")

path_to_wkhtmltopdf = r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe"
pdfkit_config = pdfkit.configuration(wkhtmltopdf=path_to_wkhtmltopdf)

pdf = pdfkit.from_string("<h1>Hello, PDF!</h1>", False, configuration=pdfkit_config)
# celery_app = celery_init_app(app)
# from app.utils import generate_html_report  # Utility to generate HTML reports
# from app.extensions import mail  # Flask-Mail instance
class Users(db.Model):
    __tablename__ = 'users'

    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    email_id = db.Column(db.String(255), unique=True, nullable=False)
    role = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    joining_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(50), default='active')
    address = db.Column(db.String(500), nullable=False)
    city_region = db.Column(db.String(50), nullable=False)

    # Relationships
    orders = db.relationship("Order", back_populates="user")
    reviews_by = db.relationship("Review", foreign_keys="Review.review_by_id", back_populates="reviewer")
    reviews_for = db.relationship("Review", foreign_keys="Review.review_for_id", back_populates="reviewed_user")
    visits = db.relationship("UserVisit", back_populates="user", cascade="all, delete-orphan")

class InactiveUsers(db.Model):
    __tablename__ = 'inactive_users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    deactivated_date = db.Column(db.Date, nullable=False)
    reason = db.Column(db.String(500), nullable=False)

    # Relationships
    user = db.relationship("Users", backref=db.backref("inactive_record", uselist=False))

class ServiceCategory(db.Model):
    __tablename__ = 'service_categories'

    category_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    category_name = db.Column(db.String(255), nullable=False, unique=True)

    # Relationships
    services = db.relationship("Service", back_populates="category")


class Service(db.Model):
    __tablename__ = 'services'

    service_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    service_category_id = db.Column(db.Integer, db.ForeignKey('service_categories.category_id', ondelete='CASCADE', name='fk_service_category'), nullable=False)
    service_name = db.Column(db.String(255), nullable=False)
    service_category_name = db.Column(db.String(255), nullable=False)
    service_description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    time_required_hrs = db.Column(db.Float, nullable=False)

    # Relationships
    category = db.relationship("ServiceCategory", back_populates="services")
    professionals = db.relationship("Professional", back_populates="service")


class Professional(db.Model):
    __tablename__ = 'professionals'

    service_user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), primary_key=True)
    service_category_id = db.Column(db.Integer, nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('services.service_id'), primary_key=True)

    # Relationships
    user = db.relationship("Users")
    service = db.relationship("Service", back_populates="professionals")
    orders = db.relationship("Order", back_populates="professional")


class Order(db.Model):
    __tablename__ = 'orders'
    order_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_placed_date = db.Column(db.Date, nullable=False)
    order_request_date = db.Column(db.Date, nullable=False)
    order_request_time_slot = db.Column(db.String(50), nullable=False)
    order_completion_date = db.Column(db.Date, nullable=True)
    order_user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    service_user_id = db.Column(db.Integer, db.ForeignKey('professionals.service_user_id'), nullable=False)
    service_category_id = db.Column(db.Integer, nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('services.service_id'), nullable=False)
    order_completion_flag = db.Column(db.Boolean, default=False)
    order_status = db.Column(db.String(50), nullable=False)
    #qty = db.Column(db.Integer, nullable=False)
    cost_of_order = db.Column(db.Float, nullable=False)
    parent_order_id = db.Column(db.Integer, db.ForeignKey('orders.order_id'), nullable=True)
    remarks = db.Column(db.Text, nullable=True)

    # Relationships
    user = db.relationship("Users", back_populates="orders")
    professional = db.relationship("Professional", back_populates="orders")
    service = db.relationship("Service")
    parent_order = db.relationship("Order", remote_side=[order_id], backref="child_orders")
    reviews = db.relationship("Review", back_populates="order")

class UserVisit(db.Model):
    __tablename__ = 'user_visits'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    visit_time = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship("Users", back_populates="visits")  # Optional relationship

    def __repr__(self):
        return f"<UserVisit(id={self.id}, user_id={self.user_id}, visit_time={self.visit_time})>"
    
class Review(db.Model):
    __tablename__ = 'reviews'

    review_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.order_id'), nullable=False)
    review_by_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    review_for_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    review_type = db.Column(db.String(50), nullable=False)  # e.g., 'user_to_professional' or 'professional_to_user'
    ratings = db.Column(db.Float, nullable=False)
    remarks = db.Column(db.Text, nullable=True)

    # Relationships
    order = db.relationship("Order", back_populates="reviews")
    reviewer = db.relationship("Users", foreign_keys=[review_by_id], back_populates="reviews_by")
    reviewed_user = db.relationship("Users", foreign_keys=[review_for_id], back_populates="reviews_for")


# with app.app_context():
#     db.create_all()  # Creates all the tables defined in your models
#     print("Database and tables created successfully!")


# with app.app_context():
#     # Obtain a connection from the engine
#     with db.engine.connect() as connection:
#         # Execute the raw SQL command to add a new column
#         connection.execute("ALTER TABLE services ADD COLUMN time_required_hrs INTEGER;")

@app.get('/')
def index():
    return render_template('index.html')

@app.route('/api/', methods=['POST'])
def signup():
    if request.method == 'POST':
        try:
            # Get JSON data from request body
            data = request.json
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            role = data.get('role')
            address = data.get('address')
            city_region = data.get('city_region')
            # Hash the password
            hashed_password = generate_password_hash(password)
            
            max_id = db.session.query(func.max(Users.user_id)).scalar()
            new_id = max_id + 1 if max_id else 1
            
            # Attempt to add the user with retry mechanism
            max_retries = 5
            retry_delay = 0.1  # in seconds
            retry_count = 0
            while retry_count < max_retries:
                try:
                    # Create a new user instance
                    new_user = Users(user_id=new_id,name=username, email_id=email, password=hashed_password, role=role, joining_date= date.today(),address=address,city_region=city_region)
                    
                    # Add the user to the database session
                    db.session.add(new_user)
                    
                    # Commit the transaction
                    db.session.commit()
                    db.session.close_all()
                    
                    # Return success response
                    return jsonify({'message': 'User signed up successfully'}), 201
                except sqlite3.OperationalError as e:
                    if "database is locked" in str(e):
                        print("Database is locked. Retrying...")
                        time.sleep(retry_delay)
                        retry_count += 1
                    else:
                        raise
            # Max retries reached, return an error response
            return jsonify({'error': 'Max retries reached. Failed to sign up user.'}), 500
        except Exception as e:
            # Handle signup error
            return jsonify({'error': str(e)}), 500
    else:
        # Return an error response for other HTTP methods
        return jsonify({'error': 'Method Not Allowed'}), 405


global current_user_id 

logging.basicConfig(level=logging.INFO)
@app.route('/api/login', methods=['POST'])
def login():
    try:
        # Get credentials from request
        data = request.json
        email = data.get('email')
        password = data.get('password')

        # Query user from database
        user = Users.query.filter_by(email_id=email).first()

        # Check if the user exists
        if not user:
            return jsonify({'message': 'Invalid email or password'}), 401

        # Check if the user is inactive
        if user.status == 'inactive':
            # Fetch the reason from the InactiveUsers table
            inactive_record = InactiveUsers.query.filter_by(user_id=user.user_id).first()
            reason = inactive_record.reason if inactive_record else "Unknown reason"
            return jsonify({
                'message': f'Your account is deactivated. Reason: {reason}. Please contact admin@uc.com for reactivation.'
            }), 403

        # Check if the password is correct
        if not check_password_hash(user.password, password):
            return jsonify({'message': 'Invalid email or password'}), 401

        # Store user_id in session for easier access during requests
        session['current_user_id'] = user.user_id
        session['role'] = user.role
        session['user_region'] = user.city_region

        # Issue JWT token
        token = pyjwt.encode(
            {'email': user.email_id, 'role': user.role},
            current_app.config['SECRET_KEY'],
            algorithm='HS256'
        )

        # Add entry to `user_visit` table
        new_visit = UserVisit(user_id=user.user_id, visit_time=date.today())
        db.session.add(new_visit)
        db.session.commit()

        # Return token and session-based user details
        return jsonify({
            'token': token,
            'role': user.role,
            'user_id': user.user_id
        }), 200

    except Exception as e:
        db.session.rollback()
        logging.error('Error during login: %s', str(e))
        return jsonify({'message': 'An unexpected error occurred.', 'error': str(e)}), 500


@app.route('/admin_home', methods=['GET', 'POST']) 
def admin_home():
    if request.method == 'GET':
        # Fetch all users
        users = Users.query.filter(Users.role == "User", Users.status == "active").all()
        users_data = [
            {
                "user_id": user.user_id,
                "name": user.name,
                "email_id": user.email_id,
                "role": user.role,
                "status": user.status,
                "address": user.address,
                "city_region": user.city_region,
                # Calculate average rating and number of reviews
                "avg_rating": round(
                    db.session.query(db.func.avg(Review.ratings))
                    .filter(Review.review_for_id == user.user_id)
                    .scalar() or 0, 1
                ),
                "num_reviews": db.session.query(Review).filter(Review.review_for_id == user.user_id).count(),
            }
            for user in users
        ]
        inactive_users = db.session.query(Users,InactiveUsers).join(Users, InactiveUsers.user_id == Users.user_id).filter(Users.status == 'inactive').all()

        # Fetch approved professionals
        approved_professionals = (
            db.session.query(Professional, Users, Service, ServiceCategory)
            .join(Users, Professional.service_user_id == Users.user_id)
            .join(Service, Professional.service_id == Service.service_id)
            .join(ServiceCategory, Service.service_category_id == ServiceCategory.category_id)
            .filter(Users.status == "approved")
            .all()
        )

        # Fetch active professionals
        active_professionals = (
            db.session.query(Professional, Users, Service, ServiceCategory)
            .join(Users, Professional.service_user_id == Users.user_id)
            .join(Service, Professional.service_id == Service.service_id)
            .join(ServiceCategory, Service.service_category_id == ServiceCategory.category_id)
            .filter(Users.status == "active")
            .all()
        )
        inactive_users_data = [

            {
                "user_id": user.user_id,
                "name": user.name,
                "email_id": user.email_id,
                "role": user.role,
                "status": user.status,
                "address": user.address,
                "city_region": user.city_region,
                "deactivated_date": inactive_user.deactivated_date.strftime("%Y-%m-%d"),
                "reason": inactive_user.reason
            }
            for user,inactive_user in inactive_users
        ]
        # Format approved professionals data
        approved_professionals_data = [
            {
                "service_user_id": prof.service_user_id,
                "service_category_id": service_category.category_id,
                "service_category_name": service_category.category_name,
                "service_id": service.service_id,
                "service_name": service.service_name,
                "name": user.name,
                "email_id": user.email_id,
                "city_region": user.city_region,
                # Calculate average rating and number of reviews
                "avg_rating": round(
                    db.session.query(db.func.avg(Review.ratings))
                    .filter(Review.review_for_id == user.user_id)
                    .scalar() or 0, 1
                ),
                "num_reviews": db.session.query(Review).filter(Review.review_for_id == user.user_id).count(),
   
            }
            for prof, user, service, service_category in approved_professionals
        ]

        # Format active professionals data
        active_professionals_data = [
            {
                "service_user_id": prof.service_user_id,
                "service_category_id": service_category.category_id,
                "service_category_name": service_category.category_name,
                "service_id": service.service_id,
                "service_name": service.service_name,
                "name": user.name,
                "email_id": user.email_id,
                "city_region": user.city_region,
            }
            for prof, user, service, service_category in active_professionals
        ]

        return jsonify({"users": users_data, 
                        "inactiveUsers": inactive_users_data,
            "approvedProfessionals": approved_professionals_data,
            "activeProfessionals": active_professionals_data,
        })

    elif request.method == 'POST':
        data = request.json
        action = data.get("action")

        if action == "add_service":
            try:
                new_service = Service(
                    service_category_id=data["service_category_id"],
                    service_name=data["service_name"],
                    service_category_name=data["service_category_name"],
                    service_description=data["service_description"],
                    price=data["price"],
                    time_required_hrs=data["time_required_hrs"],
                )
                db.session.add(new_service)
                db.session.commit()
                return jsonify({"message": "Service added successfully!"})

            except Exception as e:
                db.session.rollback()
                return jsonify({"error": str(e)}), 500
@app.route('/admin_home/approve_professional/<int:professional_id>', methods=['POST'])
def approve_professional(professional_id):
    try:
        user = Users.query.get(professional_id)
        if not user or user.status != "active":
            return jsonify({"error": "Invalid or already processed professional"}), 400

        # Update status to approved
        user.status = "approved"
        db.session.commit()
        return jsonify({"message": "Professional approved successfully!"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
@app.route('/admin_home/decline_professional/<int:professional_id>', methods=['POST'])
def decline_professional(professional_id):
    try:
        user = Users.query.get(professional_id)
        if not user or user.status != "active":
            return jsonify({"error": "Invalid or already processed professional"}), 400

        # Update status to inactive
        user.status = "inactive"

        # Add entry to InactiveUsers table
        inactive_user = InactiveUsers(
            user_id=professional_id,
            deactivated_date=date.today(),
            reason="Proof Not Satisfied",
        )
        db.session.add(inactive_user)
        db.session.commit()

        return jsonify({"message": "Professional declined successfully!"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/reactivate_user/<int:user_id>', methods=['POST'])
def reactivate_user(user_id):
    try:
        # Fetch the inactive user record
        inactive_record = InactiveUsers.query.filter_by(user_id=user_id).first()
        
        if not inactive_record:
            return jsonify({"error": "Inactive user record not found."}), 404
        
        # Reactivate the user in the Users table
        user = Users.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found."}), 404

        user.status = "active"
        db.session.delete(inactive_record)  # Remove the record from InactiveUsers table

        # Commit the changes
        db.session.commit()

        return jsonify({"message": f"User with ID {user_id} has been reactivated successfully."}), 200
    except Exception as e:
        print(f"Error reactivating user: {str(e)}")
        db.session.rollback()
        return jsonify({"error": str(e)}), 500        

@app.route('/services', methods=['GET'])
def get_services():
    try:
        # Query to fetch all services and their related categories
        services = (
            db.session.query(Service, ServiceCategory)
            .join(ServiceCategory, Service.service_category_id == ServiceCategory.category_id)
            .all()
        )

        # Format the response as a list of dictionaries
        services_data = [
            {
                "service_id": service.service_id,
                "service_category_name": category.category_name,
                "service_name": service.service_name,
                "service_description": service.service_description,
                "price": service.price,
                "time_required_hrs": service.time_required_hrs,
            }
            for service, category in services
        ]

        return jsonify({"services": services_data})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/categories', methods=['GET', 'POST'])
def manage_categories():
    if request.method == 'GET':
        # Fetch all categories
        categories = ServiceCategory.query.all()
        categories_data = [
            {
                "category_id": category.category_id,
                "category_name": category.category_name
            }
            for category in categories
        ]
        return jsonify({"categories": categories_data})

    elif request.method == 'POST':
        # Add new category
        data = request.json
        new_category_name = data.get("category_name")
        if not new_category_name:
            return jsonify({"error": "Category name is required"}), 400
        
        # Check for duplicate category name
        existing_category = ServiceCategory.query.filter_by(category_name=new_category_name).first()
        if existing_category:
            return jsonify({"error": "Category already exists"}), 400

        new_category = ServiceCategory(category_name=new_category_name)
        db.session.add(new_category)
        db.session.commit()
        return jsonify({"message": "Category added successfully!"})
@app.route('/update_category', methods=['POST'])
def update_category():
    try:
        data = request.json
        old_name = data.get("oldName")
        new_name = data.get("newName")

        if not old_name or not new_name:
            return jsonify({"error": "Invalid data provided."}), 400

        # Fetch the category to update
        category = ServiceCategory.query.filter_by(category_name=old_name).first()

        if not category:
            return jsonify({"error": "Category not found."}), 404

        # Update the category name
        category.category_name = new_name

        # Update related services with the new category name
        services = Service.query.filter_by(service_category_id=category.category_id).all()
        for service in services:
            service.service_category_name = new_name

        db.session.commit()
        return jsonify({"message": "Category updated successfully!"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
@app.route('/delete_category', methods=['POST'])
def delete_category():
    try:
        data = request.json
        category_name = data.get("categoryName")

        if not category_name:
            return jsonify({"error": "Invalid data provided."}), 400

        # Fetch the category to delete
        category = ServiceCategory.query.filter_by(category_name=category_name).first()

        if not category:
            return jsonify({"error": "Category not found."}), 404

        # Delete all services under the category
        Service.query.filter_by(service_category_id=category.category_id).delete()

        # Delete the category
        db.session.delete(category)
        db.session.commit()
        return jsonify({"message": "Category and its services deleted successfully!"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
@app.route('/update_service', methods=['POST'])
def update_service():
    try:
        data = request.json
        service_id = data.get("service_id")

        if not service_id:
            return jsonify({"error": "Invalid data provided."}), 400

        # Fetch the service to update
        service = Service.query.filter_by(service_id=service_id).first()

        if not service:
            return jsonify({"error": "Service not found."}), 404

        # Update service details
        service.service_name = data.get("service_name", service.service_name)
        service.service_description = data.get("service_description", service.service_description)
        service.price = data.get("price", service.price)
        service.time_required_hrs = data.get("time_required_hrs", service.time_required_hrs)

        db.session.commit()
        return jsonify({"message": "Service updated successfully!"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
@app.route('/delete_service', methods=['POST'])
def delete_service():
    try:
        data = request.json
        service_id = data.get("service_id")

        if not service_id:
            return jsonify({"error": "Invalid data provided."}), 400

        # Fetch the service to delete
        service = Service.query.filter_by(service_id=service_id).first()

        if not service:
            return jsonify({"error": "Service not found."}), 404

        db.session.delete(service)
        db.session.commit()
        return jsonify({"message": "Service deleted successfully!"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
from sqlalchemy.orm import aliased
@app.route('/all_orders', methods=['GET'])
def get_admin_orders():
    try:
        # Alias Reviews table for user and professional reviews
        user_review = aliased(Review)
        professional_review = aliased(Review)

        # Base query for orders
        query = (
            db.session.query(
                Order.order_id,
                Order.order_placed_date,
                Order.order_request_date,
                Order.order_request_time_slot,
                Order.order_completion_date,
                Users.name.label("order_user_name"),
                Professional.service_user_id.label("service_user_id"),
                Users.address,
                Users.city_region,
                ServiceCategory.category_name.label("service_category"),
                Service.service_name,
                Order.order_status,
                Order.remarks,
                Order.parent_order_id,
                Order.cost_of_order,
                user_review.ratings.label("ratings_by_user"),
                professional_review.ratings.label("ratings_by_professional"),
            )
            .join(Users, Order.order_user_id == Users.user_id)  # Join to get order user details
            .join(Service, Order.service_id == Service.service_id)  # Join to get service details
            .join(ServiceCategory, Order.service_category_id == ServiceCategory.category_id)  # Join to get service category
            .join(Professional, Order.service_user_id == Professional.service_user_id)  # Join to get professional details
            .outerjoin(user_review, db.and_(
                user_review.order_id == Order.order_id,
                user_review.review_type == "user_to_professional",
            ))  # Join for user-to-professional reviews
            .outerjoin(professional_review, db.and_(
                professional_review.order_id == Order.order_id,
                professional_review.review_type == "professional_to_user",
            ))  # Join for professional-to-user reviews
            # .filter(Order.order_status.in_(["Rescheduled", "Cancelled", "Closed"]))  # Filter for relevant statuses
        )

        # Get filters from request arguments
        filters = {
            "service_category": request.args.get("service_category"),
            "service_name": request.args.get("service_name"),
            "order_user_name": request.args.get("order_user_name"),
            "service_user_name": request.args.get("service_user_name"),
            "city_region": request.args.get("city_region"),
            "order_status": request.args.get("order_status"),
        }

        # Apply filters dynamically
        if filters["service_category"]:
            query = query.filter(ServiceCategory.category_name == filters["service_category"])
        if filters["service_name"]:
            query = query.filter(Service.service_name == filters["service_name"])
        if filters["order_user_name"]:
            query = query.filter(Users.name.ilike(f"%{filters['order_user_name']}%"))
        if filters["service_user_name"]:
            query = query.filter(Professional.user.has(Users.name.ilike(f"%{filters['service_user_name']}%")))
        if filters["city_region"]:
            query = query.filter(Users.city_region.ilike(f"%{filters['city_region']}%"))
        if filters["order_status"]:
            query = query.filter(Order.order_status == filters["order_status"])

        # Execute query and format results
        admin_orders = [
            {
                "order_id": row.order_id,
                "order_placed_date": row.order_placed_date.strftime("%Y-%m-%d") if row.order_placed_date else None,
                "order_request_date": row.order_request_date.strftime("%Y-%m-%d") if row.order_request_date else None,
                "order_request_time_slot": row.order_request_time_slot,
                "order_completion_date": row.order_completion_date.strftime("%Y-%m-%d") if row.order_completion_date else None,
                "order_user_name": row.order_user_name,
                "service_user_name": row.service_user_id,  # Change to fetch professional name if needed
                "address": row.address,
                "city_region": row.city_region,
                "service_category": row.service_category,
                "service_name": row.service_name,
                "order_status": row.order_status,
                "remarks": row.remarks,
                "parent_order_id": row.parent_order_id,
                "cost_of_order": row.cost_of_order,
                "ratings_by_user": row.ratings_by_user,
                "ratings_by_professional": row.ratings_by_professional,
            }
            for row in query.all()
        ]

        return jsonify({"admin_orders": admin_orders})

    except Exception as e:
        print(f"Error fetching admin orders: {e}")
        return jsonify({"error": str(e)}), 500
@app.route('/all_orders/filters', methods=['GET'])
def get_filter_values():
    try:
        # Fetch distinct values for each filter
        service_categories = db.session.query(ServiceCategory.category_name).distinct().all()
        service_names = db.session.query(Service.service_name).distinct().all()
        user_names = db.session.query(Users.name).filter(Users.role == "User").distinct().all()
        professional_names = db.session.query(Users.name).filter(Users.role == "Professional").distinct().all()
        city_regions = db.session.query(Users.city_region).distinct().all()
        order_statuses = db.session.query(Order.order_status).distinct().all()

        # Format results as a dictionary
        filters = {
            "service_categories": [item[0] for item in service_categories],
            "service_names": [item[0] for item in service_names],
            "order_user_names": [item[0] for item in user_names],
            "service_user_names": [item[0] for item in professional_names],
            "city_regions": [item[0] for item in city_regions],
            "order_statuses": [item[0] for item in order_statuses],
        }

        return jsonify(filters), 200
    except Exception as e:
        print(f"Error fetching filter values: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/user_home', methods=['GET'])
def user_home():
    try:
        services = Service.query.join(ServiceCategory).all()
        services_by_category = {}

        for service in services:
            category_name = service.category.category_name
            if category_name not in services_by_category:
                services_by_category[category_name] = []
            services_by_category[category_name].append({
                "service_id": service.service_id,
                "service_name": service.service_name,
                "service_description": service.service_description,
                "price": service.price,
                "time_required_hrs": service.time_required_hrs,
            })

        return jsonify({"servicesByCategory": services_by_category})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route('/user_home/profile', methods=['GET'])
def fetch_user_profile():
    try:
        user_id = session.get("current_user_id")
        if not user_id:
            return jsonify({"error": "User not logged in"}), 401

        user = Users.query.filter_by(user_id=user_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Calculate average rating
        average_rating = (
            db.session.query(db.func.avg(Review.ratings))
            .filter(Review.review_for_id == user_id)
            .scalar()
        )
        average_rating = round(average_rating, 2) if average_rating else "NA"

        profile_data = {
            "user_id": user.user_id,
            "name": user.name,
            "email": user.email_id,
            "password": user.password,  # Ensure this is hashed
            "joining_date": user.joining_date.strftime("%Y-%m-%d"),
            "address": user.address,
            "city_region": user.city_region,
            "average_rating": average_rating,
        }
        return jsonify(profile_data)
    except Exception as e:
        print(f"Error fetching profile: {e}")
        return jsonify({"error": "Failed to fetch profile details"}), 500
@app.route('/user_home/profile/update', methods=['POST'])
def update_user_profile():
    try:
        user_id = session.get("current_user_id")
        if not user_id:
            return jsonify({"error": "User not logged in"}), 401

        data = request.json
        user = Users.query.filter_by(user_id=user_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Update fields
        user.name = data.get("name", user.name)
        user.email_id = data.get("email", user.email_id)
        user.password = data.get("password", user.password)  # Ensure proper hashing
        user.address = data.get("address", user.address)
        user.city_region = data.get("city_region", user.city_region)

        db.session.commit()
        return jsonify({"message": "Profile updated successfully!"})
    except Exception as e:
        print(f"Error updating profile: {e}")
        db.session.rollback()
        return jsonify({"error": "Failed to update profile"}), 500

@app.route('/user_home/deactivate', methods=['POST'])
def self_deactivate_user():
    try:
        # Retrieve current user ID from the session
        user_id = session.get("current_user_id")
        if not user_id:
            return jsonify({"error": "User not logged in"}), 401

        # Fetch the user
        user = Users.query.filter_by(user_id=user_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Update user status to inactive
        user.status = "inactive"

        # Add entry to inactive_users table
        inactive_record = InactiveUsers(
            user_id=user_id,
            deactivated_date=date.today(),
            reason="User self deactivation"
        )
        db.session.add(inactive_record)
        db.session.commit()

        # Log the user out
        session.clear()

        return jsonify({"message": "Account deactivated successfully."})
    except Exception as e:
        print(f"Error deactivating user: {e}")
        db.session.rollback()
        return jsonify({"error": "Failed to deactivate account"}), 500

@app.route('/user_home/all_services', methods=['GET'])
def get_all_services():
    try:
        region = request.args.get('region', '')
        services = Service.query.join(ServiceCategory).all()

        all_services = []
        for service in services:
            all_services.append({
                "service_id": service.service_id,
                "service_name": service.service_name,
                "service_description": service.service_description,
                "price": service.price,
                "time_required_hrs": service.time_required_hrs,
                "category_name": service.category.category_name,
                "is_available": len(service.professionals) > 0,  # Check professional availability
            })

        return jsonify({"services": all_services})
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/user_home/professionals', methods=['GET'])
def get_professionals():
    try:
        # Fetch service_id and user_region
        service_id = request.args.get("service_id")
        user_region = session.get("user_region")

        # Debugging: Log inputs
        print(f"Service ID received: {service_id}")
        print(f"User Region: {user_region}")

        # Validate inputs
        if not service_id:
            return jsonify({"error": "Missing service_id"}), 400
        if not user_region:
            return jsonify({"error": "User region not found in session"}), 400

        # Convert service_id to integer
        try:
            service_id = int(service_id)
        except ValueError:
            return jsonify({"error": "Invalid service_id"}), 400

        # Query professionals
        professionals = (
            db.session.query(Professional, Users)
            .join(Users, Professional.service_user_id == Users.user_id)
            .filter(Professional.service_id == service_id, Users.city_region == user_region, Users.status == "approved")
            .all()
        )

        # Debugging: Log professionals count
        print(f"Number of professionals found: {len(professionals)}")

        # Prepare data for the frontend
        professionals_data = [
            {
                "service_user_id": professional.service_user_id,
                "name": user.name,
                "city_region": user.city_region,
                # Calculate average rating and number of reviews
                "avg_rating": round(
                    db.session.query(db.func.avg(Review.ratings))
                    .filter(Review.review_for_id == professional.service_user_id)
                    .scalar() or 0, 1
                ),
                "num_reviews": db.session.query(Review).filter(Review.review_for_id == professional.service_user_id).count(),
            }
            for professional, user in professionals
        ]

        return jsonify({"professionals": professionals_data})
    except Exception as e:
        # Log and return error
        print(f"Error fetching professionals: {str(e)}")
        return jsonify({"error": str(e)}), 500



from datetime import datetime, date

@app.route('/user_home/place_order', methods=['POST'])
def place_order():
    try:
        data = request.json

        # Convert request date to a Python date object
        request_date = datetime.strptime(data["request_date"], "%Y-%m-%d").date()

        # Set the placed date to today's date
        placed_date = date.today()

        new_order = Order(
            order_placed_date=placed_date,
            order_request_date=request_date,
            order_request_time_slot=data["request_time"],
            order_user_id=session.get("current_user_id"),  # Assuming user_id is stored in session
            service_user_id=data["professional_id"],
            service_id=data["service_id"],
            service_category_id=Service.query.get(data["service_id"]).service_category_id,
            cost_of_order=Service.query.get(data["service_id"]).price,
            order_status="Pending",
            remarks=None,
            parent_order_id=data.get("parent_order_id"),  # Use parent_order_id from request if provided
        )

        db.session.add(new_order)
        db.session.commit()
        return jsonify({"message": "Order placed successfully!"})
    except Exception as e:
        db.session.rollback()
        print(f"Error placing order: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/user_home/active_orders', methods=['GET'])
def get_active_orders():
    try:
        # Retrieve current user ID from the session
        user_id = session.get("current_user_id")

        if not user_id:
            return jsonify({"error": "User not logged in"}), 401

        # Query for active orders
        active_orders = (
            db.session.query(Order, Service, Users)
            .outerjoin(Review, db.and_(Review.order_id == Order.order_id, Review.review_type == "user_to_professional"))  # Join with reviews to check for missing reviews
            .join(Service, Order.service_id == Service.service_id)
            .join(Users, Order.service_user_id == Users.user_id)  # Join to get professional details
            .filter(
                Order.order_user_id == user_id,
                db.or_(
                    Order.order_status.in_(["Pending", "Accepted", "Started"]),
                    db.and_(
                        Order.order_status == "Closed",
                        Review.review_id == None  # Orders with no reviews
                    ),
                    db.and_(
                        Order.order_status == "Cancelled",
                        Order.remarks == "Cancelled by Professional"
                    )
                ),
                ~Order.parent_order_id.in_(
                    db.session.query(Order.order_id).filter(Order.order_status == "Rebooked")
                )  # Exclude rebooked orders
            )
            .all()
        )

        # Structure the data for frontend consumption
        orders_data = [
            {
                "order_id": order.order_id,
                "service_name": service.service_name,
                "professional_name": professional.name,
                "price": order.cost_of_order,
                "request_date": order.order_request_date.strftime("%Y-%m-%d"),
                "request_time_slot": order.order_request_time_slot,
                "status": order.order_status,
            }
            for order, service, professional in active_orders
        ]

        return jsonify({"active_orders": orders_data})
    except Exception as e:
        print(f"Error fetching active orders: {str(e)}")
        return jsonify({"error": str(e)}), 500
@app.route('/user_home/past_orders', methods=['GET'])
def get_past_orders():
    try:
        # Retrieve current user ID from the session
        user_id = session.get("current_user_id")

        if not user_id:
            return jsonify({"error": "User not logged in"}), 401

        # Query for past orders
        past_orders = (
            db.session.query(Order, Service, Users, Review)  # Include Review in the query
            .outerjoin(Review,  db.and_(Review.order_id == Order.order_id, Review.review_type == "user_to_professional"))  # Outer join with Review
            .join(Service, Order.service_id == Service.service_id)
            .join(Users, Order.service_user_id == Users.user_id)  # Join to get professional details
            .filter(
                Order.order_user_id == user_id,
                Order.order_status == "Closed"
            )
            .all()
        )

        # Structure the data for frontend consumption
        past_orders_data = [
            {
                "order_id": order.order_id,
                "service_name": service.service_name,
                "professional_name": professional.name,
                "price": order.cost_of_order,
                "request_date": order.order_request_date.strftime("%Y-%m-%d"),
                "request_time_slot": order.order_request_time_slot,
                "status": order.order_status,
                "ratings": review.ratings if review else "NA",  # Handle missing reviews
                "remarks": review.remarks if review else "NA",  # Handle missing reviews
            }
            for order, service, professional, review in past_orders
        ]

        return jsonify({"past_orders": past_orders_data})
    except Exception as e:
        print(f"Error fetching past orders: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/user_home/reschedule_order', methods=['POST'])
def reschedule_order():
    try:
        data = request.json
        print("Received data for reschedule:", data)

        order_id = data.get("order_id")
        new_date = data.get("new_request_date")
        new_time_slot = data.get("new_request_time_slot")
        print("Received Order ID:", order_id)  # Debug log

        if not order_id:
            return jsonify({"error": "Order ID is missing"}), 400

        # Fetch the existing order
        existing_order = Order.query.get(order_id)
        print("Existing Order:", existing_order)  # Debug log

        if not existing_order or existing_order.order_status != "Pending":
            return jsonify({"error": "Invalid or non-pending order"}), 400

        # Update the existing order's status to rescheduled
        existing_order.order_status = "Rescheduled"
        db.session.commit()
        print("Existing order status updated to rescheduled.")

        # Create a new order
        new_order = Order(
            order_placed_date=date.today(),
            order_request_date=datetime.strptime(new_date, "%Y-%m-%d").date(),
            order_request_time_slot=new_time_slot,
            order_user_id=existing_order.order_user_id,
            service_user_id=existing_order.service_user_id,
            service_category_id=existing_order.service_category_id,
            service_id=existing_order.service_id,
            cost_of_order=existing_order.cost_of_order,
            order_status="Pending",
            parent_order_id=existing_order.order_id,
        )
        db.session.add(new_order)
        db.session.commit()
        print("New order created successfully with ID:", new_order.order_id)

        return jsonify({"message": "Order rescheduled successfully!"})
    except Exception as e:
        db.session.rollback()
        print("Error during reschedule:", str(e))
        return jsonify({"error": str(e)}), 500



@app.route('/user_home/cancel_order', methods=['POST'])
def cancel_order():
    try:
        data = request.json
        order_id = data.get("order_id")

        if not order_id:
            return jsonify({"error": "Order ID is required"}), 400

        # Fetch the existing order
        order = Order.query.get(order_id)
        if not order or order.order_status != "Pending":
            return jsonify({"error": "Invalid or non-pending order"}), 400

        # Update the order's status to cancelled
        order.order_status = "cancelled"
        order.remarks = "Cancelled by User"
        db.session.commit()

        return jsonify({"message": "Order cancelled successfully!"})
    except Exception as e:
        db.session.rollback()
        print(f"Error cancelling order: {str(e)}")
        return jsonify({"error": str(e)}), 500
@app.route('/user_home/close_order', methods=['POST'])
def closed_order():
    try:
        data = request.json
        order_id = data.get("order_id")

        if not order_id:
            return jsonify({"error": "Order ID is required"}), 400

        # Fetch the existing order
        order = Order.query.get(order_id)
        if not order or order.order_status != "Started":
            return jsonify({"error": "Invalid or non-commenced order"}), 400

        # Update the order's status to cancelled
        order.order_status = "Closed"
        order.order_completion_flag = 1
        order.order_completion_date = date.today()
        db.session.commit()

        return jsonify({"message": "Order closed successfully!"})
    except Exception as e:
        db.session.rollback()
        print(f"Error cancelling order: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/professional_home/details', methods=['GET'])
def professional_home_details():
    try:
        professional_id = session.get('current_user_id')
        if not professional_id:
            return jsonify({'error': 'User not logged in'}), 401

        professional = Users.query.get(professional_id)
        if not professional or professional.role != 'Professional':
            return jsonify({'error': 'Unauthorized access'}), 403

        # Fetch assigned service
        assigned_service = (
            db.session.query(Service, ServiceCategory)
            .join(ServiceCategory, Service.service_category_id == ServiceCategory.category_id)
            .join(Professional, Professional.service_id == Service.service_id)
            .filter(Professional.service_user_id == professional_id)
            .first()
        )

        assigned_service_data = {
            "service_name": assigned_service.Service.service_name,
            "category_name": assigned_service.ServiceCategory.category_name,
        } if assigned_service else None

        # Fetch available services
        available_services = (
            db.session.query(Service, ServiceCategory)
            .join(ServiceCategory, Service.service_category_id == ServiceCategory.category_id)
            .all()
        )
        available_services_data = [
            {
                "service_id": service.Service.service_id,
                "service_name": service.Service.service_name,
                "category_name": service.ServiceCategory.category_name,
            }
            for service in available_services
        ]

        # Fetch active orders
        active_orders = (
            db.session.query(Order, Service, Users)
            .outerjoin(Review, db.and_(Review.order_id == Order.order_id, Review.review_type == "professional_to_user"))
            .join(Service, Order.service_id == Service.service_id)
            .join(Users, Order.order_user_id == Users.user_id)
            .filter(Order.service_user_id == professional_id,  db.or_(
                    Order.order_status.in_(["Pending", "Accepted", "Started"]),
                    db.and_(
                        Order.order_status == "Closed",
                        Review.review_id == None  # Orders with no reviews
                    )
                ))
            .all()
        )
        
        active_orders_data = [
            {
                "order_id": order.Order.order_id,
                "service_name": order.Service.service_name,
                "user_name": order.Users.name,
                "user_address": order.Users.address,
                "order_request_date":order.Order.order_request_date.strftime("%Y-%m-%d"),
                "order_request_time_slot":order.Order.order_request_time_slot,
                "price": order.Order.cost_of_order,
                "status": order.Order.order_status,
                "avg_rating": round(
                    db.session.query(db.func.avg(Review.ratings))
                    .filter(Review.review_for_id == order.Order.order_user_id)
                    .scalar() or 0, 1
                ),
                "num_reviews": db.session.query(Review).filter(Review.review_for_id == order.Order.order_user_id).count(),
            }
            for order in active_orders
        ]

        return jsonify({
            "professionalName": professional.name,
            "assignedService": assigned_service_data,
            "availableServices": available_services_data,
            "activeOrders": active_orders_data,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route('/professional_home/past_orders', methods=['GET'])
def professional_past_orders():
    try:
        # Retrieve current user ID from the session
        user_id = session.get("current_user_id")

        if not user_id:
            return jsonify({"error": "User not logged in"}), 401

        # Query for past orders
        past_orders = (
            db.session.query(Order, Service, Users, Review)  # Include Review in the query
            .outerjoin(Review, db.and_(Review.order_id == Order.order_id, Review.review_type == "professional_to_user"))  # Outer join with Review
            .join(Service, Order.service_id == Service.service_id)
            .join(Users, Order.order_user_id == Users.user_id)  # Join to get professional details
            .filter(
                Order.service_user_id == user_id,
                Order.order_status == "Closed"
            )
            .all()
        )

        # Structure the data for frontend consumption
        past_orders_data = [
            {
                "order_id": order.order_id,
                "service_name": service.service_name,
                "user_name": user.name,
                "user_address": user.address,
                "price": order.cost_of_order,
                "request_date": order.order_request_date.strftime("%Y-%m-%d"),
                "request_time_slot": order.order_request_time_slot,
                "status": order.order_status,
                "ratings": review.ratings if review else "NA",  # Handle missing reviews
                "remarks": review.remarks if review else "NA",  # Handle missing reviews
            }
            for order, service, user, review in past_orders
        ]

        return jsonify({"past_orders": past_orders_data})
    except Exception as e:
        print(f"Error fetching past orders: {str(e)}")
        return jsonify({"error": str(e)}), 500
@app.route('/professional_home/profile', methods=['GET'])
def fetch_professional_profile():
    try:
        user_id = session.get("current_user_id")
        if not user_id:
            return jsonify({"error": "User not logged in"}), 401

        user = Users.query.filter_by(user_id=user_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Calculate average rating
        average_rating = (
            db.session.query(db.func.avg(Review.ratings))
            .filter(Review.review_for_id == user_id)
            .scalar()
        )
        average_rating = round(average_rating, 2) if average_rating else "NA"

        profile_data = {
            "user_id": user.user_id,
            "name": user.name,
            "email": user.email_id,
            "password": user.password,  # Ensure this is hashed
            "joining_date": user.joining_date.strftime("%Y-%m-%d"),
            "address": user.address,
            "city_region": user.city_region,
            "average_rating": average_rating,
        }
        return jsonify(profile_data)
    except Exception as e:
        print(f"Error fetching profile: {e}")
        return jsonify({"error": "Failed to fetch profile details"}), 500
@app.route('/professional_home/profile/update', methods=['POST'])
def update_professional_profile():
    try:
        user_id = session.get("current_user_id")
        if not user_id:
            return jsonify({"error": "User not logged in"}), 401

        data = request.json
        user = Users.query.filter_by(user_id=user_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Update fields
        user.name = data.get("name", user.name)
        user.email_id = data.get("email", user.email_id)
        user.password = data.get("password", user.password)  # Ensure proper hashing
        user.address = data.get("address", user.address)
        user.city_region = data.get("city_region", user.city_region)

        db.session.commit()
        return jsonify({"message": "Profile updated successfully!"})
    except Exception as e:
        print(f"Error updating profile: {e}")
        db.session.rollback()
        return jsonify({"error": "Failed to update profile"}), 500

@app.route('/professional_home/deactivate', methods=['POST'])
def self_deactivate_professional():
    try:
        # Retrieve current user ID from the session
        user_id = session.get("current_user_id")
        if not user_id:
            return jsonify({"error": "User not logged in"}), 401

        # Fetch the user
        user = Users.query.filter_by(user_id=user_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Update user status to inactive
        user.status = "inactive"

        # Add entry to inactive_users table
        inactive_record = InactiveUsers(
            user_id=user_id,
            deactivated_date=date.today(),
            reason="User self deactivation"
        )
        db.session.add(inactive_record)
        db.session.commit()

        # Log the user out
        session.clear()

        return jsonify({"message": "Account deactivated successfully."})
    except Exception as e:
        print(f"Error deactivating user: {e}")
        db.session.rollback()
        return jsonify({"error": "Failed to deactivate account"}), 500

@app.route('/professional_home/assign_service_with_proof', methods=['POST'])
def assign_service_with_proof():
    try:
        professional_id = session.get('current_user_id')
        if not professional_id:
            return jsonify({'error': 'User not logged in'}), 401

        if 'proof' not in request.files:
            return jsonify({'error': 'No proof file uploaded'}), 400

        file = request.files['proof']
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Only PDFs are allowed.'}), 400

        service_id = request.form.get('service_id')
        if not service_id:
            return jsonify({'error': 'Service ID is required'}), 400

        service = Service.query.get(service_id)
        if not service:
            return jsonify({'error': 'Invalid service ID'}), 400

        # Save the proof file
        filename = secure_filename(f"professional_{professional_id}.pdf")
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(file_path)

        # Assign service to professional
        existing_mapping = Professional.query.filter_by(service_user_id=professional_id).first()
        if existing_mapping:
            return jsonify({'error': 'Service already assigned'}), 400

        new_mapping = Professional(
            service_user_id=professional_id,
            service_id=service.service_id,
            service_category_id=service.service_category_id,
        )
        db.session.add(new_mapping)
        db.session.commit()

        # Save the proof file path in the database (optional)
        # E.g., save the file path in a new column in the Professional table

        return jsonify({'message': 'Service and proof submitted successfully!'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
@app.route('/professional_home/orders/<int:order_id>/<action>', methods=['POST'])
def update_order_status(order_id, action):
    try:
        professional_id = session.get('current_user_id')
        if not professional_id:
            return jsonify({'error': 'User not logged in'}), 401

        order = Order.query.filter_by(order_id=order_id, service_user_id=professional_id).first()
        if not order:
            return jsonify({'error': 'Order not found'}), 404

        if action == "accept":
            order.order_status = "Accepted"
        elif action == "reject":
            order.order_status = "Cancelled"
            order.remarks = "Cancelled by Professional"
        elif action == "start":
            if order.order_status != "Accepted":
                return jsonify({'error': 'Order must be accepted before starting'}), 400
            order.order_status = "Started"
        else:
            return jsonify({'error': 'Invalid action'}), 400

        db.session.commit()
        return jsonify({'message': f"Order {action.capitalize()}ed successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
@app.route('/admin_home/professional_proof/<int:professional_id>', methods=['GET'])
def get_professional_proof(professional_id):
    try:
        # Construct file path (ensure this matches your saving logic)
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], f"professional_{professional_id}.pdf")
        if not os.path.exists(file_path):
            return jsonify({'error': 'Proof file not found'}), 404

        return send_file(file_path, as_attachment=True)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/feedback/order/<int:order_id>', methods=['GET'])
def get_order_details(order_id):
    try:
        print(f"Fetching details for order_id: {order_id}")  # Debug log

        order = (
            db.session.query(Order, Service, Users)
            .join(Service, Order.service_id == Service.service_id)
            .join(Users, Order.service_user_id == Users.user_id)  # Professional details
            .filter(Order.order_id == order_id)
            .first()
        )

        print(f"Order query result: {order}")  # Debug log

        if not order:
            return jsonify({"error": "Order not found"}), 404

        order_data = {
            "order_id": order.Order.order_id,
            "order_placed_date": order.Order.order_placed_date.strftime("%Y-%m-%d"),
            "order_request_date": order.Order.order_request_date.strftime("%Y-%m-%d"),
            "order_request_time_slot": order.Order.order_request_time_slot,
            "service_category_name": order.Service.service_category_name,
            "service_name": order.Service.service_name,
            "professional_name": order.Users.name,
            "professional_id": order.Order.service_user_id,
            "user_id": order.Order.order_user_id,
            "order_status": order.Order.order_status,
            "cost_of_order": order.Order.cost_of_order,
        }

        return jsonify(order_data)
    except Exception as e:
        print(f"Error fetching order details: {e}")
        return jsonify({"error": str(e)}), 500

    
from datetime import date

@app.route('/deactivate_user', methods=['POST'])
def deactivate_user():
    try:
        data = request.json
        user_id = data.get("user_id")
        reason = data.get("reason")

        if not user_id or not reason:
            return jsonify({"error": "Missing user ID or reason"}), 400

        # Fetch the user
        user = Users.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Check if the user is already inactive
        if user.status == "inactive":
            return jsonify({"error": "User is already inactive"}), 400

        # Move the user to inactive_users table
        inactive_user = InactiveUsers(
            user_id=user.user_id,
            deactivated_date=date.today(),
            reason=reason,
        )
        db.session.add(inactive_user)

        # Update the status in the users table
        user.status = "inactive"
        db.session.commit()

        return jsonify({"message": "User deactivated successfully!"})
    except Exception as e:
        db.session.rollback()
        print(f"Error deactivating user: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/submit_feedback', methods=['POST'])
def submit_feedback():
    try:
        data = request.json
        print("Received feedback data:", data)

        # Extract fields from the request
        order_id = data.get("order_id")
        review_for_id = data.get("review_for_id")
        review_by_id = session.get("current_user_id")
        review_type = data.get("review_type")
        ratings = data.get("ratings")
        remarks = data.get("remarks")

        # Validate required fields
        if not all([order_id, review_by_id, review_for_id, review_type, ratings, remarks]):
            return jsonify({"error": "Missing required fields"}), 400

        # Validate the user ID
        if not Users.query.get(review_by_id):
            return jsonify({"error": "Invalid user ID"}), 404

        # Validate the professional ID
        if not Users.query.get(review_for_id):
            return jsonify({"error": "Invalid professional ID"}), 404

        # Create and save the review
        new_review = Review(
            order_id=order_id,
            review_by_id=review_by_id,
            review_for_id=review_for_id,
            review_type=review_type,
            ratings=ratings,
            remarks=remarks,
        )
        db.session.add(new_review)
        db.session.commit()

        return jsonify({"message": "Feedback submitted successfully!"}), 200
    except Exception as e:
        print(f"Error submitting feedback: {str(e)}")
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



@celery_app.task
def daily_reminder():
    """Send daily reminders to professionals who haven't visited or have pending requests."""
    with app.app_context():
        # Get all active professionals
        professionals = Users.query.join(Professional, Professional.service_user_id == Users.user_id)\
                                   .filter(Users.status == 'approved').all()

        for professional in professionals:
            # Check if the professional visited today
            visited_today = UserVisit.query.filter(
                UserVisit.user_id == professional.user_id,
                db.func.date(UserVisit.visit_time) == date.today()
            ).first()

            # Check for pending service requests
            pending_requests = Order.query.filter(
                Order.service_user_id == professional.user_id,
                Order.order_status.in_(["Pending", "Accepted"])
            ).all()

            if not visited_today or pending_requests:
                # Send reminder email
                message = f"Hi {professional.name},\n\n" \
                          f"You have pending service requests. Please visit the platform to accept/reject them."
                msg = Message(
                    subject="Daily Reminder: Pending Service Requests",
                    sender=app.config['SENDER_EMAIL'],
                    recipients=[professional.email_id],
                    body=message
                )
                mail.send(msg)

        return f"Daily reminders sent to {len(professionals)} professionals."


@celery_app.task
def send_monthly_report():
    """Send a detailed monthly activity report to users with their orders placed in the current month."""
    with app.app_context():
        # Get the current month and year
        current_month = date.today().month
        current_year = date.today().year

        # Get all active users
        users = Users.query.filter(Users.status == 'active').all()

        for user in users:
            # Fetch orders placed by the user in the current month
            monthly_orders = Order.query.filter(
                Order.order_user_id == user.user_id,
                db.func.extract('month', Order.order_placed_date) == current_month,
                db.func.extract('year', Order.order_placed_date) == current_year
            ).all()

            if not monthly_orders:
                continue  # Skip if no orders for the current month

            # Generate HTML report for the user's orders
            report_html = f"""
            <html>
            <body>
                <h1>Monthly Activity Report</h1>
                <p>Dear {user.name},</p>
                <p>Here is the summary of your service orders placed in {date.today().strftime('%B %Y')}:</p>
                <table border="1" style="border-collapse: collapse; width: 100%;">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Order Date</th>
                            <th>Service Name</th>
                            <th>Professional Name</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
            """

            for order in monthly_orders:
                professional = Users.query.get(order.service_user_id)
                report_html += f"""
                <tr>
                    <td>{order.order_id}</td>
                    <td>{order.order_placed_date.strftime('%Y-%m-%d')}</td>
                    <td>{order.service.service_name}</td>
                    <td>{professional.name if professional else 'N/A'}</td>
                    <td>{order.order_status}</td>
                </tr>
                """

            report_html += """
                    </tbody>
                </table>
                <p>Thank you for choosing our services!</p>
            </body>
            </html>
            """

            # Convert HTML to PDF
            path_to_wkhtmltopdf = r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe"
            pdfkit_config = pdfkit.configuration(wkhtmltopdf=path_to_wkhtmltopdf)
            pdf = pdfkit.from_string(report_html, False, configuration=pdfkit_config)

            # Send email with the report to the user
            msg = Message(
                subject="Your Monthly Activity Report",
                sender=app.config['SENDER_EMAIL'],
                recipients=[user.email_id],
                body=f"Hello {user.name},\n\nPlease find attached your monthly activity report for {date.today().strftime('%B %Y')}."
            )
            msg.attach(f"Monthly_Report_{user.user_id}.pdf", "application/pdf", pdf)
            mail.send(msg)

        return f"Monthly reports sent to all active users."
@celery_app.task
def export_service_requests():
    """Export service requests closed by professionals to a CSV file."""
    with app.app_context():
        # Fetch service requests with status 'Closed'
        closed_requests = Order.query.filter(Order.order_status == 'Closed').all()

        if not closed_requests:
            return "No closed service requests to export."

        # Prepare the CSV content
        csv_file_path = "closed_service_requests.csv"
        with open(csv_file_path, mode="w", newline="", encoding="utf-8") as csvfile:
            fieldnames = ["Order ID", "Service Name", "Customer Name", "Professional Name", "Order Date", "Remarks"]
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

            writer.writeheader()
            for request in closed_requests:
                writer.writerow({
                    "Order ID": request.order_id,
                    "Service Name": request.service.service_name,
                    "Customer Name": request.user.name,
                    "Professional Name": Users.query.get(request.service_user_id).name,
                    "Order Date": request.order_placed_date.strftime("%Y-%m-%d"),
                    "Remarks": request.remarks or "N/A",
                })

        # Notify admin or trigger user action
        msg = Message(
            subject="Service Requests Export Completed",
            sender=app.config['SENDER_EMAIL'],
            recipients=[app.config['ADMIN_EMAIL']],
            body="The export of closed service requests has been completed. The CSV file is attached.",
        )
        with open(csv_file_path, "rb") as f:
            msg.attach("closed_service_requests.csv", "text/csv", f.read())
        mail.send(msg)

        return "Service requests export completed and email sent."


# def generate_pdf():
#     """Generate a PDF report."""
#     html = "<h1>Monthly Report</h1><p>This is the monthly report content.</p>"
#     path_to_wkhtmltopdf = r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe"
#     pdfkit_config = pdfkit.configuration(wkhtmltopdf=path_to_wkhtmltopdf)
#     pdf = pdfkit.from_string(html, False, configuration=pdfkit_config)
#     return pdf

# pdf = generate_pdf()
# with open("test.pdf", "wb") as f:
#     f.write(pdf)

def send_message_with_attachment(to, subject, content_body, attachment_data, filename):
    """Send an email with an attachment."""
    msg = MIMEMultipart()
    msg["To"] = to
    msg["Subject"] = subject
    msg["From"] = "21f2000619@ds.study.iitm.ac.in"
    msg.attach(MIMEText(content_body, 'html'))
    
    attachment = MIMEApplication(attachment_data)
    attachment.add_header("Content-Disposition", "attachment", filename=filename)
    msg.attach(attachment)

    with SMTP(host="localhost", port=1025) as client:
        client.send_message(msg=msg)

# Routes
@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Schedule daily reminders at 8:00 AM
    sender.add_periodic_task(
        crontab(hour=2, minute=35),
        daily_reminder.s(),
    )

    # Schedule monthly report on the 1st day of every month at 10:00 AM
    sender.add_periodic_task(
        crontab(hour=2, minute=35, day_of_month=30),
        send_monthly_report.s(),
    )

    sender.add_periodic_task(
        crontab(hour=2, minute=35, day_of_week="sat"),
        export_service_requests.s(),
    )

if __name__ == '__main__':
    app.run(debug=True)
