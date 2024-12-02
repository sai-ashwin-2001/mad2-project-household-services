export default {
    template: `
    <div>
        <!-- Navbar -->
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">Admin Dashboard</a>
                <div class="collapse navbar-collapse">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <a 
                                class="nav-link" 
                                href="#" 
                                :class="{ active: currentPage === 'home' }" 
                                @click="navigateTo('home')">Home</a>
                        </li>
                        <li class="nav-item">
                            <a 
                                class="nav-link" 
                                href="#" 
                                :class="{ active: currentPage === 'addService' }" 
                                @click="navigateTo('addService')">Add Service</a>
                        </li>
                        <li class="nav-item">
                            <a 
                                class="nav-link" 
                                href="#" 
                                :class="{ active: currentPage === 'allOrders' }" 
                                @click="navigateTo('allOrders')">All Orders</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
        <div v-if="currentPage === 'allOrders'">
    <h1>All Orders</h1>
        
        <!-- Filters Section -->
        <div class="filters">
            <label>
                Service Category:
                <select v-model="filters.service_category" class="form-select">
                    <option value="">All</option>
                    <option v-for="category in filterOptions.service_categories" :value="category" :key="category">
                        {{ category }}
                    </option>
                </select>
            </label>
            <label>
                Service Name:
                <select v-model="filters.service_name" class="form-select">
                    <option value="">All</option>
                    <option v-for="name in filterOptions.service_names" :value="name" :key="name">
                        {{ name }}
                    </option>
                </select>
            </label>
            <label>
                Order User Name:
                <select v-model="filters.order_user_name" class="form-select">
                    <option value="">All</option>
                    <option v-for="user in filterOptions.order_user_names" :value="user" :key="user">
                        {{ user }}
                    </option>
                </select>
            </label>
            <label>
                Service User Name:
                <select v-model="filters.service_user_name" class="form-select">
                    <option value="">All</option>
                    <option v-for="professional in filterOptions.service_user_names" :value="professional" :key="professional">
                        {{ professional }}
                    </option>
                </select>
            </label>
            <label>
                City Region:
                <select v-model="filters.city_region" class="form-select">
                    <option value="">All</option>
                    <option v-for="region in filterOptions.city_regions" :value="region" :key="region">
                        {{ region }}
                    </option>
                </select>
            </label>
            <label>
                Order Status:
                <select v-model="filters.order_status" class="form-select">
                    <option value="">All</option>
                    <option v-for="status in filterOptions.order_statuses" :value="status" :key="status">
                        {{ status }}
                    </option>
                </select>
            </label>
            <button @click="fetchOrders" class="btn btn-primary mt-3">Filter</button>
        </div>

        <!-- Orders Table -->
        <table class="table table-striped mt-4">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Placed Date</th>
                    <th>Request Date</th>
                    <th>Time Slot</th>
                    <th>Completion Date</th>
                    <th>User Name</th>
                    <th>Professional ID</th>
                    <th>Address</th>
                    <th>City Region</th>
                    <th>Category</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    <th>Parent Order ID</th>
                    <th>Cost</th>
                    <th>User Ratings</th>
                    <th>Professional Ratings</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="order in orders" :key="order.order_id">
                    <td>{{ order.order_id }}</td>
                    <td>{{ order.order_placed_date }}</td>
                    <td>{{ order.order_request_date }}</td>
                    <td>{{ order.order_request_time_slot }}</td>
                    <td>{{ order.order_completion_date }}</td>
                    <td>{{ order.order_user_name }}</td>
                    <td>{{ order.service_user_name }}</td>
                    <td>{{ order.address }}</td>
                    <td>{{ order.city_region }}</td>
                    <td>{{ order.service_category }}</td>
                    <td>{{ order.service_name }}</td>
                    <td>{{ order.order_status }}</td>
                    <td>{{ order.remarks }}</td>
                    <td>{{ order.parent_order_id }}</td>
                    <td>{{ order.cost_of_order }}</td>
                    <td>{{ order.ratings_by_user }}</td>
                    <td>{{ order.ratings_by_professional }}</td>
                </tr>
            </tbody>
        </table>
    </div>
        <!-- Home Page -->
        <div v-if="currentPage === 'home'">
            <h1>Admin Home Page</h1>

            <h2>Users</h2>
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Address</th>
                        <th>City & Region</th>
                        <th>Ratings</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users" :key="user.user_id">
                        <td>{{ user.user_id }}</td>
                        <td>{{ user.name }}</td>
                        <td>{{ user.email_id }}</td>
                        <td>{{ user.address }}</td>
                        <td>{{ user.city_region }}</td>
                        <td>
                {{ 
                    user.num_reviews > 0 
                    ? user.avg_rating + ' (' + user.num_reviews + ' reviews)' 
                    : 'NA' 
                }}
            </td>
                <td>
                <button
                    class="btn btn-danger btn-sm"
                    @click="openDeactivationPrompt(user.user_id)"
                >
                    Deactivate
                </button>
            </td>

                    </tr>
                </tbody>
            </table>

            <!-- Approved Professionals -->
            <h2>Approved Professionals</h2>
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Service Category</th>
                        <th>Service Name</th>
                        <th>City & Region</th>
                        <th>Ratings</th>
                        <th>Proof</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="professional in approvedProfessionals" :key="professional.service_user_id">
                        <td>{{ professional.service_user_id }}</td>
                        <td>{{ professional.name }}</td>
                        <td>{{ professional.email_id }}</td>
                        <td>{{ professional.service_category_name }}</td>
                        <td>{{ professional.service_name }}</td>
                        <td>{{ professional.city_region }}</td>
                        <td>
                {{ 
                    professional.num_reviews > 0 
                    ? professional.avg_rating + ' (' + professional.num_reviews + ' reviews)' 
                    : 'NA' 
                }}
            </td>
                        <td>
                            <a :href="'/admin_home/professional_proof/' + professional.service_user_id" target="_blank">
                                View Proof
                            </a>
                        </td>
                        <td>
                        <button
                            class="btn btn-danger btn-sm"
                            @click="openDeactivationPrompt(professional.service_user_id)"
                        >
                            Deactivate
                        </button>
                    </td>
                    </tr>
                </tbody>
            </table>

            <!-- Active Professionals -->
            <h2>To Be Approved Professionals</h2>
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Service Category</th>
                        <th>Service Name</th>
                        <th>City & Region</th>
                        <th>Proof</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="professional in activeProfessionals" :key="professional.service_user_id">
                        <td>{{ professional.service_user_id }}</td>
                        <td>{{ professional.name }}</td>
                        <td>{{ professional.email_id }}</td>
                        <td>{{ professional.service_category_name }}</td>
                        <td>{{ professional.service_name }}</td>
                        <td>{{ professional.city_region }}</td>
                        <td>
                            <a :href="'/admin_home/professional_proof/' + professional.service_user_id" target="_blank">
                                View Proof
                            </a>
                        </td>
                        <td>
                            <button class="btn btn-success btn-sm" @click="approveProfessional(professional.service_user_id)">
                                Approve
                            </button>
                            <button class="btn btn-danger btn-sm" @click="declineProfessional(professional.service_user_id)">
                                Decline
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <!-- Deactivation Modal -->
<div v-if="showDeactivationModal" class="modal">
    <div class="modal-content">
        <h2>Deactivate User</h2>
        <p>Reason for Deactivation:</p>
        <select v-model="deactivationReason" class="form-select">
            <option value="" disabled>Select a reason</option>
            <option value="Poor Reviews">Poor Reviews</option>
            <option value="Fraudulent Activity">Fraudulent Activity</option>
            <option value="Unserviceable Address">Unserviceable Address</option>
        </select>
        <div class="mt-3">
            <button class="btn btn-danger" @click="confirmDeactivation">Confirm</button>
            <button class="btn btn-secondary" @click="closeDeactivationPrompt">Cancel</button>
        </div>
    </div>
</div>
<h2>Inactive Users</h2>
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Email</th>
                        <th>Address</th>
                        <th>City & Region</th>
                        <th>Deactivation Date</th>
                        <th>Reason</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in inactiveUsers" :key="user.user_id">
                        <td>{{ user.user_id }}</td>
                        <td>{{ user.name }}</td>
                        <td>{{ user.role }}</td>
                        <td>{{ user.email_id }}</td>
                        <td>{{ user.address }}</td>
                        <td>{{ user.city_region }}</td>
                        <td>
                {{ 
                   user.deactivated_date
                }}
            </td>
            <td>{{ user.reason }}</td>
                <td>
                <button
                    class="btn btn-primary btn-sm"
                    @click="openReactivationPrompt(user.user_id)"
                >
                    Reactivate
                </button>
            </td>

                    </tr>
                </tbody>
            </table>
            <!-- Services by Category -->
            <h2>Services by Category</h2>
        <div v-for="item in servicesWithIds" :key="item.categoryName" class="mb-4">
    <!-- Collapsible Button with Update/Delete for Category -->
    <div class="d-flex justify-content-between align-items-center mb-2">
        <button
            class="btn btn-primary w-75 text-start"
            type="button"
            :data-bs-toggle="'collapse'"
            :data-bs-target="'#' + item.id"
            aria-expanded="false"
            :aria-controls="item.id"
        >
            {{ isEditingCategory[item.categoryName] ? 
                '' : item.categoryName }}
            <input 
                v-if="isEditingCategory[item.categoryName]" 
                v-model="editValue[item.categoryName]" 
                class="form" />
            </button>
        
                <div class="d-flex justify-content-end">
            <!-- Update Button -->
            <button
                class="btn btn-warning btn-sm mx-1"
                @click="editCategory(item.categoryName)"
                v-if="!isEditingCategory[item.categoryName]"
            >
                Update
            </button>
            <button
                class="btn btn-success btn-sm mx-1"
                @click="updateCategory(item.categoryName)"
                v-if="isEditingCategory[item.categoryName]"
            >
                OK
            </button>

            <!-- Delete Button -->
            <button
                class="btn btn-danger btn-sm mx-1"
                @click="confirmDeleteCategory(item.categoryName)"
            >
                Delete
            </button>
        </div>
    </div>

    <!-- Collapsible Content -->
    <div :id="item.id" class="collapse">
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
    <tr v-for="service in item.services" :key="service.service_id">
        <td>
            <!-- Input for Service Name -->
            <input
                v-if="isEditingService[service.service_id]"
                v-model="service.editServiceName"
                class="form-control"
            />
            <span v-else>{{ service.service_name }}</span>
        </td>
        <td>
            <!-- Input for Description -->
            <input
                v-if="isEditingService[service.service_id]"
                v-model="service.editDescription"
                class="form-control"
            />
            <span v-else>{{ service.service_description }}</span>
        </td>
        <td>
            <!-- Input for Price -->
            <input
                v-if="isEditingService[service.service_id]"
                v-model="service.editPrice"
                class="form-control"
                type="number"
            />
            <span v-else>{{ service.price }}</span>
        </td>
        <td>
            <!-- Input for Time Required -->
            <input
                v-if="isEditingService[service.service_id]"
                v-model="service.editTimeRequired"
                class="form-control"
                type="number"
            />
            <span v-else>{{ service.time_required_hrs }}</span>
        </td>
        <td>
            <div>
                <!-- Update Button -->
                <button
                    class="btn btn-warning btn-sm mx-1"
                    @click="editService(service)"
                    v-if="!isEditingService[service.service_id]"
                >
                    Update
                </button>
                <button
                    class="btn btn-success btn-sm mx-1"
                    @click="updateService(service)"
                    v-if="isEditingService[service.service_id]"
                >
                    OK
                </button>

                <!-- Delete Button -->
                <button
                    class="btn btn-danger btn-sm mx-1"
                    @click="confirmDeleteService(service.service_id)"
                >
                    Delete
                </button>
            </div>
        </td>
    </tr>
</tbody>

        </table>
    </div>
</div>


        </div>

        <!-- Add Service Page -->
        <div v-if="currentPage === 'addService'">
            <h1>Add New Service</h1>
            <form @submit.prevent="addService">
                <select v-model="newService.category_name" class="form-control mt-2" required>
                    <option value="" disabled selected>Select a Category</option>
                    <option v-for="category in categories" :value="category.category_name" :key="category.category_id">
                        {{ category.category_name }}
                    </option>
                </select>
                <input v-model="newService.service_name" placeholder="Service Name" class="form-control mt-2" required />
                <input v-model="newService.service_description" placeholder="Description" class="form-control mt-2" required />
                <input v-model="newService.price" placeholder="Price" type="number" class="form-control mt-2" required />
                <input v-model="newService.time_required_hrs" placeholder="Time Required (hrs)" type="number" class="form-control mt-2" required />
                <button type="submit" class="btn btn-success mt-2">Add Service</button>
            </form>

            <h1 class="mt-4">Add New Category</h1>
            <form @submit.prevent="addCategory">
                <input v-model="newCategoryName" placeholder="Category Name" class="form-control mt-2" required />
                <button type="submit" class="btn btn-primary mt-2">Add Category</button>
            </form>
        </div>
    </div>

    
    `,
    data() {
        return {
            currentPage: "home",
            users: [],
            approvedProfessionals: [],
            activeProfessionals: [],
            inactiveUsers: [],
            categories: [],
            servicesByCategory: {},
            newService: {
                category_name: "",
                service_name: "",
                service_description: "",
                price: null,
                time_required_hrs: null,
            },
            newCategoryName: "",
            isEditingCategory: {}, // Tracks which categories are being edited
        editValue: {}, // Temporary storage for edited category names
        isEditingService: {}, // Tracks which services are being edited
        showDeactivationModal: false, // Controls modal visibility
        deactivationUserId: null, // Stores user ID for deactivation
        deactivationReason: "", // Stores the selected reason
        orders: [],
            filters: {
                service_category: "",
                service_name: "",
                order_user_name: "",
                service_user_name: "",
                city_region: "",
                order_status: "",
            },
            filterOptions: {
                service_categories: [],
                service_names: [],
                order_user_names: [],
                service_user_names: [],
                city_regions: [],
                order_statuses: [],
            },
        };
    },
    computed: {
        servicesWithIds() {
            return Object.entries(this.servicesByCategory).map(([categoryName, services]) => {
                const id = "collapse-" + categoryName.replace(/\s+/g, "-");
                return { categoryName, services, id };
            });
        },
    },
    methods: {
        navigateTo(page) {
            this.currentPage = page;
            if (page === "home") {
                this.fetchData();
            } else if (page === "allOrders") {
                console.log("Navigating to allOrders page");
                this.fetchOrders();
            }
        },
        async fetchData() {
            try {
                const response = await fetch("/admin_home");
                const data = await response.json();
                if (response.ok) {
                    this.users = data.users;
                    this.approvedProfessionals = data.approvedProfessionals;
                    this.activeProfessionals = data.activeProfessionals;
                    this.inactiveUsers = data.inactiveUsers;
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        },
        async fetchCategories() {
            try {
                const response = await fetch("/categories");
                const data = await response.json();
                this.categories = data.categories;
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        },
        async fetchServices() {
            try {
                const response = await fetch("/services");
                const data = await response.json();
                this.servicesByCategory = data.services.reduce((acc, service) => {
                    const category = service.service_category_name;
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(service);
                    return acc;
                }, {});
            } catch (error) {
                console.error("Error fetching services:", error);
            }
        },
        async approveProfessional(professionalId) {
            try {
                const confirmApprove = confirm("Are you sure you want to approve this professional?");
                if (!confirmApprove) return;
    
                const response = await fetch(`/admin_home/approve_professional/${professionalId}`, {
                    method: "POST",
                });
    
                const data = await response.json();
                if (response.ok) {
                    alert(data.message || "Professional approved successfully!");
                    await this.fetchProfessionals(); // Refresh the professionals list
                } else {
                    alert(data.error || "Failed to approve professional.");
                }
            } catch (error) {
                console.error("Error approving professional:", error);
            }
        },
        async declineProfessional(professionalId) {
            try {
                const confirmDecline = confirm("Are you sure you want to decline this professional?");
                if (!confirmDecline) return;
    
                const response = await fetch(`/admin_home/decline_professional/${professionalId}`, {
                    method: "POST",
                });
    
                const data = await response.json();
                if (response.ok) {
                    alert(data.message || "Professional declined successfully!");
                    await this.fetchProfessionals(); // Refresh the professionals list
                } else {
                    alert(data.error || "Failed to decline professional.");
                }
            } catch (error) {
                console.error("Error declining professional:", error);
            }
        },
        async addCategory() {
            try {
                const response = await fetch("/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ category_name: this.newCategoryName }),
                });
                const result = await response.json();
                if (result.error) {
                    alert(result.error);
                } else {
                    alert("Category added successfully!");
                    this.newCategoryName = "";
                    this.fetchCategories();
                }
            } catch (error) {
                console.error("Error adding category:", error);
            }
        },
        async addService() {
            try {
                const selectedCategory = this.categories.find(
                    (cat) => cat.category_name === this.newService.category_name
                );
                if (!selectedCategory) {
                    alert("Invalid category selected!");
                    return;
                }
                const response = await fetch("/admin_home", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "add_service",
                        service_category_id: selectedCategory.category_id,
                        service_name: this.newService.service_name,
                        service_category_name: this.newService.category_name,
                        service_description: this.newService.service_description,
                        price: this.newService.price,
                        time_required_hrs: this.newService.time_required_hrs,
                    }),
                });
                const result = await response.json();
                if (result.error) {
                    alert(result.error);
                } else {
                    alert("Service added successfully!");
                    this.fetchServices();
                    this.navigateTo("home");
                }
            } catch (error) {
                console.error("Error adding service:", error);
            }
        },
        editCategory(categoryName) {
            this.$set(this.isEditingCategory, categoryName, true);
            this.$set(this.editValue, categoryName, categoryName);
        },
        async updateCategory(categoryName) {
            try {
                const newName = this.editValue[categoryName];
                const response = await fetch("/update_category", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ oldName: categoryName, newName }),
                });
                const result = await response.json();
                if (result.error) {
                    alert(result.error);
                } else {
                    alert("Category updated successfully!");
                    this.fetchServices();
                    this.fetchCategories();
                }
            } catch (error) {
                console.error("Error updating category:", error);
            } finally {
                this.$set(this.isEditingCategory, categoryName, false);
            }
        },
        confirmDeleteCategory(categoryName) {
            if (confirm("Are you sure you want to delete this category and its services?")) {
                this.deleteCategory(categoryName);
            }
        },
        async deleteCategory(categoryName) {
            try {
                const response = await fetch("/delete_category", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ categoryName }),
                });
                const result = await response.json();
                if (result.error) {
                    alert(result.error);
                } else {
                    alert("Category deleted successfully!");
                    this.fetchServices();
                    this.fetchCategories();
                }
            } catch (error) {
                console.error("Error deleting category:", error);
            }
        },
        editService(service) {
            // Set the edit mode for the service
            this.$set(this.isEditingService, service.service_id, true);
    
            // Initialize editable fields with current values
            this.$set(service, 'editServiceName', service.service_name);
            this.$set(service, 'editDescription', service.service_description);
            this.$set(service, 'editPrice', service.price);
            this.$set(service, 'editTimeRequired', service.time_required_hrs);
        },
        async updateService(service) {
            try {
                const response = await fetch("/update_service", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        service_id: service.service_id,
                        service_name: service.editServiceName,
                        service_description: service.editDescription,
                        price: service.editPrice,
                        time_required_hrs: service.editTimeRequired,
                    }),
                });
    
                const result = await response.json();
                if (result.error) {
                    alert(result.error);
                } else {
                    alert("Service updated successfully!");
                    this.fetchServices(); // Refresh data
                }
            } catch (error) {
                console.error("Error updating service:", error);
            } finally {
                this.$set(this.isEditingService, service.service_id, false);
            }
        },
        confirmDeleteService(serviceId) {
            if (confirm("Are you sure you want to delete this service?")) {
                this.deleteService(serviceId);
            }
        },
        async deleteService(serviceId) {
            try {
                const response = await fetch("/delete_service", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ service_id: serviceId }),
                });
                const result = await response.json();
                if (result.error) {
                    alert(result.error);
                } else {
                    alert("Service deleted successfully!");
                    this.fetchServices();
                }
            } catch (error) {
                console.error("Error deleting service:", error);
            }
        },
        openDeactivationPrompt(userId) {
            this.deactivationUserId = userId;
            this.showDeactivationModal = true;
        },
        closeDeactivationPrompt() {
            this.deactivationUserId = null;
            this.deactivationReason = "";
            this.showDeactivationModal = false;
        },
        async confirmDeactivation() {
            if (!this.deactivationReason) {
                alert("Please select a reason for deactivation.");
                return;
            }
        
            try {
                const response = await fetch("/deactivate_user", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: this.deactivationUserId,
                        reason: this.deactivationReason,
                    }),
                });
        
                const result = await response.json();
                if (result.error) {
                    alert(result.error);
                } else {
                    alert("User deactivated successfully!");
                    await this.fetchData(); // Refresh user data
                    this.closeDeactivationPrompt();
                }
            } catch (error) {
                console.error("Error deactivating user:", error);
            }
        },
        async fetchFilters() {
            try {
                console.log("Fetching filter options...");
                const response = await fetch("/all_orders/filters");
                const data = await response.json();
                console.log("Filter options fetched:", data);
        
                if (response.ok) {
                    this.filterOptions = data;
                } else {
                    alert(data.error || "Failed to fetch filters.");
                }
            } catch (error) {
                console.error("Error fetching filters:", error);
            }
        },
        
        async fetchOrders() {
            try {
                const params = new URLSearchParams(this.filters).toString();
                console.log("Fetching orders with params:", params);
                const response = await fetch(`/all_orders?${params}`);
                const data = await response.json();
                console.log("Fetched orders data:", data);
        
                if (response.ok) {
                    this.orders = data.admin_orders;
                    console.log("Orders set to:", this.orders);
                } else {
                    alert(data.error || "Failed to fetch orders.");
                }
            } catch (error) {
                console.error("Error fetching orders:", error);
            }
        },
        async openReactivationPrompt(userId) {
            const confirmReactivation = confirm(
                "Are you sure you want to reactivate this user?"
            );
            if (confirmReactivation) {
                await this.reactivateUser(userId);
            }
        },
        async reactivateUser(userId) {
            try {
                const response = await fetch(`/reactivate_user/${userId}`, {
                    method: "POST",
                });
                const data = await response.json();
                if (response.ok) {
                    alert(data.message || "User reactivated successfully.");
                    await this.fetchInactiveUsers(); // Refresh the list
                } else {
                    alert(data.error || "Failed to reactivate user.");
                }
            } catch (error) {
                console.error("Error reactivating user:", error);
            }
        },
    },
    mounted() {
        this.fetchData();
        this.fetchCategories();
        this.fetchServices();
        this.fetchFilters();
        this.fetchOrders();
    },
};
