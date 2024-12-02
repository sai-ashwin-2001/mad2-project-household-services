export default {
    template: `
    <div>
        <!-- Navbar -->
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">Professional Dashboard</a>
                <div class="collapse navbar-collapse">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <a class="nav-link" href="#" :class="{ active: currentPage === 'home' }" @click="navigateTo('home')">Home</a> </li>
                            <li class="nav-item">
                             <a class="nav-link" href="#" :class="{ active: currentPage === 'past_orders' }" @click="navigateTo('past_orders')">Past Orders</a></li>
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
            <h1>Welcome, {{ professionalName }}</h1>

            <!-- Service Assignment -->
            <div v-if="assignedService">
                <h2>Your Assigned Service</h2>
                <p><strong>Service Category:</strong> {{ assignedService.category_name }}</p>
                <p><strong>Service Name:</strong> {{ assignedService.service_name }}</p>
            </div>
            <div v-else>
                <h2>Choose a Service and Upload Proof of Experience</h2>
                <p>Select the service you are willing to work on:</p>
                <select v-model="selectedService" class="form-select">
                    <option v-for="service in availableServices" :value="service.service_id" :key="service.service_id">
                        {{ service.category_name }} - {{ service.service_name }}
                    </option>
                </select>
                <input type="file" ref="proofFile" accept="application/pdf" class="form-control mt-3" />
                <button class="btn btn-success mt-3" @click="submitServiceAndProof">Submit</button>
            </div>

            <!-- Active Orders -->
            <h2 class="mt-5">Active Orders</h2>
            <div v-if="activeOrders.length > 0">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Service Name</th>
                            <th>User Name</th>
                            <th>User Address</th>
                            <th>Service Request Date</th>
                            <th>Service Request Time Slot</th>
                            <th>Price</th>
                            <th>User Rating</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="order in activeOrders" :key="order.order_id">
                            <td>{{ order.order_id }}</td>
                            <td>{{ order.service_name }}</td>
                            <td>{{ order.user_name }}</td>
                            <td>{{ order.user_address }}</td>
                            <td>{{ order.order_request_date }}</td>
                            <td>{{ order.order_request_time_slot }}</td>
                            <td>{{ order.price }}</td>
                            <td>{{ order.avg_rating }} ({{ order.num_reviews }} reviews)</td>
                            <td>{{ order.status }}</td>
                            <td>
                                <button v-if="order.status === 'Pending'" class="btn btn-success btn-sm" @click="acceptOrder(order.order_id)">Accept</button>
                                <button v-if="order.status === 'Pending'" class="btn btn-danger btn-sm" @click="rejectOrder(order.order_id)">Reject</button>
                                <button v-if="order.status === 'Accepted'" class="btn btn-primary btn-sm" @click="startOrder(order.order_id)">Start Service</button>
                                <button
                                    v-if="order.status === 'Closed'"
                                    class="btn btn-primary btn-sm"
                                    @click="navigateToFeedback(order.order_id, 'professional_to_user')"
                                >
                                    Give Feedback
                                </button>

                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-else>
                <p>No active orders available.</p>
            </div>
        </div>
        <!-- Past Orders Page -->
<div v-if="currentPage === 'past_orders'">
    <h1>Past Orders</h1>
    <div v-if="pastOrders.length > 0">
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Service Name</th>
                    <th>User Name</th>
                    <th>User Address</th>
                    <th>Request Date</th>
                    <th>Request Time Slot</th>
                    <th>Price</th>
                    <th>Ratings</th>
                    <th>Remarks</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="order in pastOrders" :key="order.order_id">
                    <td>{{ order.order_id }}</td>
                    <td>{{ order.service_name }}</td>
                    <td>{{ order.user_name }}</td>
                    <td>{{ order.user_address }}</td>
                    <td>{{ order.request_date }}</td>
                    <td>{{ order.request_time_slot }}</td>
                    <td>{{ order.price }}</td>
                    <td>{{ order.ratings }}</td>
                    <td>{{ order.remarks }}</td>
                </tr>
            </tbody>
        </table>
    </div>
    <div v-else>
        <p>No past orders available.</p>
    </div>
</div>

    </div>
    `,
    data() {
        return {
            currentPage: "home",
            professionalName: "",
            assignedService: null,
            availableServices: [],
            selectedService: null,
            activeOrders: [],
            pastOrders: [],
            profile: {}, // Original profile details fetched from the backend
            editableProfile: {}, // Temporary storage for editable details
            isEditing: false,
        };
    },
    methods: {
        async fetchProfessionalDetails() {
            try {
                const response = await fetch("/professional_home/details");
                const data = await response.json();
                if (response.ok) {
                    this.professionalName = data.professionalName;
                    this.assignedService = data.assignedService;
                    this.availableServices = data.availableServices;
                    this.activeOrders = data.activeOrders;
                } else {
                    alert(data.error);
                }
            } catch (error) {
                console.error("Error fetching professional details:", error);
            }
        },
        async submitServiceAndProof() {
            if (!this.selectedService) {
                alert("Please select a service.");
                return;
            }

            const proofFile = this.$refs.proofFile.files[0];
            if (!proofFile || proofFile.type !== "application/pdf") {
                alert("Please upload a valid PDF file.");
                return;
            }

            const formData = new FormData();
            formData.append("service_id", this.selectedService);
            formData.append("proof", proofFile);

            try {
                const response = await fetch("/professional_home/assign_service_with_proof", {
                    method: "POST",
                    body: formData,
                });

                const result = await response.json();
                if (result.error) {
                    alert(result.error);
                } else {
                    alert("Service and proof submitted successfully!");
                    this.fetchProfessionalDetails();
                }
            } catch (error) {
                console.error("Error submitting service and proof:", error);
            }
        },
        async submitAssignedService() {
            if (!this.selectedService) {
                alert("Please select a service.");
                return;
            }

            try {
                const response = await fetch("/professional_home/assign_service", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ service_id: this.selectedService }),
                });
                const result = await response.json();
                if (result.error) {
                    alert(result.error);
                } else {
                    alert("Service assigned successfully!");
                    this.fetchProfessionalDetails();
                }
            } catch (error) {
                console.error("Error assigning service:", error);
            }
        },
        async acceptOrder(orderId) {
            try {
                const response = await fetch(`/professional_home/orders/${orderId}/accept`, { method: "POST" });
                const result = await response.json();
                if (result.error) {
                    alert(result.error);
                } else {
                    alert("Order accepted successfully!");
                    this.fetchProfessionalDetails();
                }
            } catch (error) {
                console.error("Error accepting order:", error);
            }
        },
        async rejectOrder(orderId) {
            if (!confirm("Are you sure you want to reject this order?")) return;

            try {
                const response = await fetch(`/professional_home/orders/${orderId}/reject`, { method: "POST" });
                const result = await response.json();
                if (result.error) {
                    alert(result.error);
                } else {
                    alert("Order rejected successfully!");
                    this.fetchProfessionalDetails();
                }
            } catch (error) {
                console.error("Error rejecting order:", error);
            }
        },
        async startOrder(orderId) {
            try {
                const response = await fetch(`/professional_home/orders/${orderId}/start`, { method: "POST" });
                const result = await response.json();
                if (result.error) {
                    alert(result.error);
                } else {
                    alert("Order started successfully!");
                    this.fetchProfessionalDetails();
                }
            } catch (error) {
                console.error("Error starting order:", error);
            }
        },
        async fetchPastOrders() {
            try {
                const response = await fetch("/professional_home/past_orders");
                const data = await response.json();
                if (response.ok) {
                    this.pastOrders = data.past_orders;
                } else {
                    alert(data.error || "Failed to fetch past orders.");
                }
            } catch (error) {
                console.error("Error fetching past orders:", error);
            }
        },
        async fetchProfile() {
            try {
                const response = await fetch("/professional_home/profile");
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
                const response = await fetch("/professional_home/profile/update", {
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
                const response = await fetch("/professional_home/deactivate", { method: "POST" });
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
        navigateTo(page) {
            this.currentPage = page;
            if (page === "past_orders") {
                this.fetchPastOrders();
            }
        },
        navigateToFeedback(orderId, feedbackContext) {
            console.log("Navigating to feedback with orderId:", orderId, "and context:", feedbackContext); // Debugging
            this.$router.push({
                name: "feedback",
                params: { orderId: orderId, feedbackContext: feedbackContext },
            });
        },
    },
    mounted() {
        this.fetchProfessionalDetails();
        this.fetchProfile();
    },
};
