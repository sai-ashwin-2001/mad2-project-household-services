export default {
    template: `
    <div>
        <!-- Navbar -->
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">User Dashboard</a>
                <div class="collapse navbar-collapse">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <a class="nav-link" href="#" :class="{ active: currentPage === 'home' }" @click="navigateTo('home')">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#" :class="{ active: currentPage === 'search' }" @click="navigateTo('search')">Search</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#" :class="{ active: currentPage === 'pastOrders' }" @click="navigateTo('pastOrders')">Past Orders</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#" :class="{ active: currentPage === 'profile' }" @click="navigateTo('profile')">Profile</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
        <!-- Profile Page -->
        <div v-if="currentPage === 'profile'">
            <h1>Your Profile</h1>
            <div class="profile-details">
                <div class="form-group">
                    <label for="userId">User ID:</label>
                    <input type="text" id="userId" class="form-control" :value="profile.user_id" readonly />
                </div>
                <div class="form-group">
                    <label for="userName">Name:</label>
                    <input 
                        type="text" 
                        id="userName" 
                        class="form-control" 
                        v-model="editableProfile.name" 
                        :readonly="!isEditing" />
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input 
                        type="email" 
                        id="email" 
                        class="form-control" 
                        v-model="editableProfile.email" 
                        :readonly="!isEditing" />
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input 
                        type="password" 
                        id="password" 
                        class="form-control" 
                        v-model="editableProfile.password" 
                        :readonly="!isEditing" />
                </div>
                <div class="form-group">
                    <label for="joiningDate">Joining Date:</label>
                    <input 
                        type="text" 
                        id="joiningDate" 
                        class="form-control" 
                        :value="profile.joining_date" 
                        readonly />
                </div>
                <div class="form-group">
                    <label for="address">Address:</label>
                    <textarea 
                        id="address" 
                        class="form-control" 
                        v-model="editableProfile.address" 
                        :readonly="!isEditing">
                    </textarea>
                </div>
                <div class="form-group">
                    <label for="cityRegion">City Region:</label>
                    <select 
                        id="cityRegion" 
                        class="form-control" 
                        v-model="editableProfile.city_region" 
                        :disabled="!isEditing">
                        <option value="bengaluru_central">Bengaluru Central</option>
                        <option value="bengaluru_north">Bengaluru North</option>
                        <option value="bengaluru_east">Bengaluru East</option>
                        <option value="bengaluru_west">Bengaluru West</option>
                        <option value="bengaluru_south">Bengaluru South</option>
                        <option value="chennai_central">Chennai Central</option>
                        <option value="chennai_north">Chennai North</option>
                        <option value="chennai_south">Chennai South</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="averageRating">Average Rating:</label>
                    <input 
                        type="text" 
                        id="averageRating" 
                        class="form-control" 
                        :value="profile.average_rating" 
                        readonly />
                </div>
                <button 
                    class="btn btn-primary" 
                    v-if="!isEditing" 
                    @click="enableEditing">Edit</button>
                <button 
                    class="btn btn-success" 
                    v-if="isEditing" 
                    @click="saveProfile">Save</button>
                <button 
                    class="btn btn-secondary" 
                    v-if="isEditing" 
                    @click="cancelEditing">Cancel</button>
                    <button 
                    class="btn btn-danger mt-3" 
                    @click="deactivateAccount">Deactivate Account</button>
            </div>
        </div>
        <!-- Home Page -->
        <div v-if="currentPage === 'home'">
            <h1>Book Your Service</h1>
            <!-- Category-Wise Collapsible View -->
    <div v-for="(services, categoryName) in servicesByCategory" :key="categoryName" class="mb-4">
        <!-- Collapsible Header -->
        <div class="card">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <button
                    class="btn btn-primary w-75 text-start"
                    type="button"
                    :data-bs-toggle="'collapse'"
                    :data-bs-target="'#category-' + categoryName.replace(/\\s+/g, '-')"
                    aria-expanded="false"
                >
                    {{ categoryName }}
                </button>
            </div>
            <!-- Collapsible Content -->
            <div :id="'category-' + categoryName.replace(/\\s+/g, '-')" class="collapse">
                <table class="table table-striped mt-2">
                    <thead>
                        <tr>
                            <th>Service Name</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th>Time Required (hrs)</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="service in services" :key="service.service_id">
                        <td>{{ service.service_name }}</td>
                        <td>{{ service.service_description }}</td>
                        <td>{{ service.price }}</td>
                        <td>{{ service.time_required_hrs }}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" @click="bookService(service)">
                                Book Now
                            </button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

            <h1>Your Active Orders</h1>
    <div v-if="activeOrders.length > 0">
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Service Name</th>
                    <th>Professional Name</th>
                    <th>Price</th>
                    <th>Request Date</th>
                    <th>Request Time Slot</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="order in activeOrders" :key="order.order_id">
                    <td>{{order.order_id}}</td>
                    <td>{{ order.service_name }}</td>
                    <td>{{ order.professional_name }}</td>
                    <td>{{ order.price }}</td>
                    <td>{{ order.request_date }}</td>
                    <td>{{ order.request_time_slot }}</td>
                    <td :class="{ 'text-success': order.status === 'Accepted', 'text-warning': order.status === 'Pending' }">
                        {{ order.status }}
                    </td>

                    <td>
                        <button 
                            v-if="order.status === 'Pending' || order.status === 'Accepted'"
                            class="btn btn-warning btn-sm" 
                            @click="openRescheduleDialog(order)"
                        >
                            Reschedule
                        </button>
                        <button 
                            v-if="order.status === 'Pending' || order.status === 'Accepted'"
                            class="btn btn-danger btn-sm" 
                            @click="cancelOrder(order.order_id)"
                        >
                            Cancel
                        </button>
                        <button 
                            v-if="order.status === 'Started'"
                            class="btn btn-danger btn-sm" 
                            @click="closeOrder(order.order_id)"
                        >
                            Close Request
                        </button>
                         <button
                            v-if="order.status === 'Closed'"
                            class="btn btn-primary btn-sm"
                            @click="navigateToFeedback(order.order_id, 'user_to_professional')"
                        >
                            Give Feedback
                        </button>
                        <button
                            v-if="order.status === 'Cancelled'"
                            class="btn btn-primary btn-sm"
                            @click="bookService(order.service_id)"
                        >
                            Book Again
                        </button>


                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div v-else>
        <p>You have no active orders.</p>
    </div>

    <!-- Reschedule Dialog -->
    <div v-if="showRescheduleDialog" class="modal">
    <div class="modal-content">
        <h2>Reschedule Order</h2>
        <p>Service: {{ rescheduleOrderDetails?.service_name }}</p>
        <p>Professional: {{ rescheduleOrderDetails?.professional_name }}</p>

        <h3>Choose New Date and Time</h3>
        <input type="date" v-model="newRequestDate" class="form-control" />
        <div>
            <label>
                <input type="radio" value="9-12" v-model="newRequestTimeSlot" /> 9-12
            </label>
            <label>
                <input type="radio" value="12-15" v-model="newRequestTimeSlot" /> 12-15
            </label>
            <label>
                <input type="radio" value="15-18" v-model="newRequestTimeSlot" /> 15-18
            </label>
            <label>
                <input type="radio" value="18-21" v-model="newRequestTimeSlot" /> 18-21
            </label>
        </div>
        <button class="btn btn-success mt-3" @click="submitReschedule">Confirm</button>
        <button class="btn btn-secondary mt-3" @click="closeRescheduleDialog">Cancel</button>
    </div>
</div>

</div>
<div v-if="currentPage === 'search'">
    <h1>Search Services</h1>

    <!-- Search Input -->
    <input
        type="text"
        class="form-control mb-3"
        v-model="searchQuery"
        placeholder="Search for services by name or description..."
    />

    <!-- Services Table -->
    <table class="table table-striped mt-2">
        <thead>
            <tr>
                <th>Service Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Time Required (hrs)</th>
                <th>Availability</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
    <tr v-if="services.length === 0">
        <td colspan="6">No services available.</td>
    </tr>
    <tr v-else v-for="service in filteredServices" :key="service.service_id">
        <td>{{ service.service_name }}</td>
        <td>{{ service.service_description }}</td>
        <td>{{ service.price }}</td>
        <td>{{ service.time_required_hrs }}</td>
        <td>{{ service.is_available ? "Yes" : "No" }}</td>
        <td>
            <button
                        class="btn btn-primary btn-sm"
                        :disabled="!service.is_available"
                        @click="bookService(service)"
                    >
                        Book Now
                    </button>

        </td>
    </tr>
</tbody>

    </table>
</div>

        <!-- Booking Page -->
        <div v-if="currentPage === 'bookService'">
            <h1>Book Service: {{ selectedService.service_name }}</h1>
            <div>
            
                <p><strong>Description:</strong> {{ selectedService.service_description }}</p>
        <p><strong>Price:</strong> {{ selectedService.price }}</p>
        <p><strong>Time Required:</strong> {{ selectedService.time_required_hrs }} hours</p>
    
                <h2>Select Professional</h2>
                <div v-if="professionals.length > 0">
                    <select v-model="selectedProfessional" class="form-select">
                        <option v-for="professional in professionals" :value="professional.service_user_id" :key="professional.service_user_id">
                            {{ professional.name }} - {{ professional.city_region }} [{{ professional.avg_rating }} stars ({{ professional.num_reviews }} reviews)]
                        </option>
                    </select>
                </div>
                <div v-else>
                    <p>Service not available in your region.</p>
                </div>

                <h2>Choose Request Date and Time</h2>
                <input type="date" v-model="requestDate" class="form-control" />
                <div>
                    <label>
                        <input type="radio" value="9-12" v-model="requestTime" /> 9-12
                    </label>
                    <label>
                        <input type="radio" value="12-15" v-model="requestTime" /> 12-15
                    </label>
                    <label>
                        <input type="radio" value="15-18" v-model="requestTime" /> 15-18
                    </label>
                    <label>
                        <input type="radio" value="18-21" v-model="requestTime" /> 18-21
                    </label>
                </div>

                <button class="btn btn-success mt-3" @click="submitOrder" :disabled="professionals.length === 0">
    Submit
</button>

            </div>
        </div>
        <div v-if="currentPage === 'pastOrders'">
    <h1>Your Past Orders</h1>
    <div v-if="pastOrders.length > 0">
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Service Name</th>
                    <th>Professional Name</th>
                    <th>Price</th>
                    <th>Request Date</th>
                    <th>Request Time Slot</th>
                    <th>Status</th>
                    <th>Ratings</th>
                    <th>Remarks</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="order in pastOrders" :key="order.order_id">
                    <td>{{ order.order_id }}</td>
                    <td>{{ order.service_name }}</td>
                    <td>{{ order.professional_name }}</td>
                    <td>{{ order.price }}</td>
                    <td>{{ order.request_date }}</td>
                    <td>{{ order.request_time_slot }}</td>
                    <td>{{ order.status }}</td>
                    <td>{{ order.ratings || "N/A" }}</td>
                    <td>{{ order.remarks || "N/A" }}</td>

                </tr>
            </tbody>
        </table>
    </div>
    <div v-else>
        <p>You have no past orders.</p>
    </div>
</div>

    </div>
    `,
    data() {
        return {
            currentPage: "home",
            servicesByCategory: {},
            activeOrders: [],
            pastOrders: [], // Add pastOrders to store past orders data
            selectedService: null, // Initialize as null
            professionals: [],
            selectedProfessional: null,
            requestDate: null,
            requestTime: null,
            showRescheduleDialog: false,
            rescheduleOrderDetails: null,
            newRequestDate: null,
            newRequestTimeSlot: null,
            searchQuery: "",
            services: [], // Array to store all services
            profile: {}, // Original profile details fetched from the backend
            editableProfile: {}, // Temporary storage for editable details
            isEditing: false,
        };
    },
    computed: {
        filteredServices() {
            const query = this.searchQuery.toLowerCase();
            if (!query) {
                console.log("No search query, showing all services.");
                return this.services;
            }
            const filtered = this.services.filter(
                (service) =>
                    service.service_name.toLowerCase().includes(query) ||
                    service.service_description.toLowerCase().includes(query)
            );
            console.log("Filtered services:", filtered);
            return filtered;
        }
        
    },
    methods: {
        
        async fetchServices() {
            try {
                const response = await fetch(`/user_home/all_services?region=${this.userRegion || ""}`);
                const data = await response.json();
        
                if (response.ok) {
                    console.log("Fetched services:", data.services); // Debug log
                    this.services = data.services;
        
                    this.servicesByCategory = this.services.reduce((categories, service) => {
                        const categoryName = service.category_name || "Uncategorized";
                        if (!categories[categoryName]) {
                            categories[categoryName] = [];
                        }
                        categories[categoryName].push(service);
                        return categories;
                    }, {});
                } else {
                    console.error(data.error || "Failed to fetch services.");
                }
            } catch (error) {
                console.error("Error fetching services:", error);
            }
        }
        
        ,
        async fetchActiveOrders() {
            try {
                const response = await fetch("/user_home/active_orders");
                const data = await response.json();
                if (response.ok) {
                    this.activeOrders = data.active_orders;
                } else {
                    console.error(data.error || "Failed to fetch active orders.");
                }
            } catch (error) {
                console.error("Error fetching active orders:", error);
            }
        },
        openRescheduleDialog(order) {
            console.log("Reschedule button clicked for order:", order);
            this.rescheduleOrderDetails = order;
            this.showRescheduleDialog = true;
        },
        closeRescheduleDialog() {
            this.showRescheduleDialog = false;
            this.rescheduleOrderDetails = null;
            this.newRequestDate = null;
            this.newRequestTimeSlot = null;
        },
        async submitReschedule() {
            console.log("Rescheduling order:", this.rescheduleOrderDetails);
            console.log("Order ID:", this.rescheduleOrderDetails?.order_id);
        
            if (!this.newRequestDate || !this.newRequestTimeSlot) {
                alert("Please select a new date and time slot.");
                return;
            }
        
            try {
                const response = await fetch("/user_home/reschedule_order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        order_id: this.rescheduleOrderDetails?.order_id,
                        new_request_date: this.newRequestDate,
                        new_request_time_slot: this.newRequestTimeSlot,
                    }),
                });
        
                const result = await response.json();
                if (result.error) {
                    alert(result.error);
                } else {
                    alert("Order rescheduled successfully!");
                    this.fetchActiveOrders();
                    this.closeRescheduleDialog();
                }
            } catch (error) {
                console.error("Error rescheduling order:", error);
            }
        }
        ,
        async fetchPastOrders() {
            try {
                const response = await fetch("/user_home/past_orders");
                const data = await response.json();
                if (response.ok) {
                    this.pastOrders = data.past_orders;
                } else {
                    console.error(data.error || "Failed to fetch past orders.");
                }
            } catch (error) {
                console.error("Error fetching past orders:", error);
            }
        },
        
        async cancelOrder(orderId) {
            if (!confirm("Are you sure you want to cancel this order?")) {
                return;
            }
    
            try {
                const response = await fetch("/user_home/cancel_order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ order_id: orderId }),
                });
    
                const result = await response.json();
                if (result.error) {
                    alert(result.error);
                } else {
                    alert("Order cancelled successfully!");
                    this.fetchActiveOrders();
                }
            } catch (error) {
                console.error("Error cancelling order:", error);
            }
        },
        async closeOrder(orderId) {
            if (!confirm("Are you sure you want to close this order?")) {
                return;
            }
    
            try {
                const response = await fetch("/user_home/close_order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ order_id: orderId }),
                });
    
                const result = await response.json();
                if (result.error) {
                    alert(result.error);
                } else {
                    alert("Order closed successfully!");
                    this.fetchActiveOrders();
                }
            } catch (error) {
                console.error("Error closing order:", error);
            }
        },
        async bookService(service) {
            console.log("bookService called with:", service); // Log the passed service object
            if (!service || !service.service_id) {
                console.error("Invalid service object:", service);
                return;
            }
        
            try {
                this.currentPage = "bookService";
                this.selectedService = {
                    service_id: service.service_id,
                    service_name: service.service_name,
                    service_description: service.service_description,
                    price: service.price,
                    time_required_hrs: service.time_required_hrs,
                };
        
                const response = await fetch(`/user_home/professionals?service_id=${service.service_id}`);
                const data = await response.json();
        
                if (response.ok) {
                    this.professionals = data.professionals;
                } else {
                    console.error(data.error || "Failed to fetch professionals.");
                }
            } catch (error) {
                console.error("Error fetching professionals for the service:", error);
            }
        }
        
        ,
        
        async submitOrder() {
            if (!this.selectedProfessional || !this.requestDate || !this.requestTime) {
                alert("Please fill all fields before submitting.");
                return;
            }
        
            try {
                const response = await fetch("/user_home/place_order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        service_id: this.selectedService.service_id,
                        professional_id: this.selectedProfessional,
                        request_date: this.requestDate,
                        request_time: this.requestTime,
                        parent_order_id: this.parentOrderId || null, // Pass parent_order_id if it exists
                    }),
                });
        
                const result = await response.json();
                if (result.error) {
                    alert(result.error);
                } else {
                    alert("Order placed successfully!");
                    this.fetchActiveOrders(); // Refresh active orders
                    this.navigateTo("home");
                }
            } catch (error) {
                console.error("Error placing order:", error);
            }
        }
        ,
        async fetchProfile() {
            try {
                const response = await fetch("/user_home/profile");
                const data = await response.json();
                if (response.ok) {
                    this.profile = data;
                    this.editableProfile = { ...data }; // Create a copy for editing
                } else {
                    alert(data.error || "Failed to fetch profile details.");
                }
            } catch (error) {
                console.error("Error fetching profile details:", error);
            }
        },
        enableEditing() {
            this.isEditing = true;
        },
        cancelEditing() {
            this.isEditing = false;
            this.editableProfile = { ...this.profile }; // Revert to original details
        },
        async saveProfile() {
            try {
                const response = await fetch("/user_home/profile/update", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(this.editableProfile),
                });

                const result = await response.json();
                if (response.ok) {
                    alert("Profile updated successfully!");
                    this.isEditing = false;
                    this.profile = { ...this.editableProfile }; // Update the original profile
                } else {
                    alert(result.error || "Failed to update profile.");
                }
            } catch (error) {
                console.error("Error saving profile details:", error);
            }
        },
        async deactivateAccount() {
            if (!confirm("Are you sure you want to deactivate your account? This action cannot be undone.")) {
                return;
            }

            try {
                const response = await fetch("/user_home/deactivate", { method: "POST" });
                const result = await response.json();

                if (response.ok) {
                    alert("Your account has been deactivated. You will now be logged out.");
                    // Redirect to login page after deactivation
                    window.location.href = "/";
                } else {
                    alert(result.error || "Failed to deactivate account.");
                }
            } catch (error) {
                console.error("Error deactivating account:", error);
            }
        },
        navigateToFeedback(orderId, feedbackContext) {
            console.log("Navigating to feedback with:", { orderId, feedbackContext }); // Debug
    
            this.$router.push({
                name: "feedback",
                params: {
                    orderId: orderId,
                    feedbackContext: feedbackContext, // Pass context dynamically
                },
            });
        },
        navigateTo(page) {
            console.log("Navigating to:", page); // Log page navigation
            this.currentPage = page;
            if (page === "pastOrders") {
                this.fetchPastOrders();
            }
            if (page === "search") {
                console.log("Fetching services for search...");
                this.fetchServices(); // Ensure this is called for search
            }
        }
        
        
    },
    mounted() {
        this.fetchServices();
        this.fetchActiveOrders();
        this.fetchProfile();
    },
};
