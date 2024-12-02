export default {
    template: `
    <div>
        <h1>
            Feedback for Order #{{ orderDetails.order_id }} 
            <span v-if="feedbackContext === 'user_to_professional'">
                by Professional #{{ orderDetails.professional_id }}
            </span>
            <span v-else>
                by User #{{ orderDetails.user_id }}
            </span>
        </h1>
        <div class="order-details">
            <p><strong>Order ID:</strong> {{ orderDetails.order_id }}</p>
            <p><strong>Order Placed Date:</strong> {{ orderDetails.order_placed_date }}</p>
            <p><strong>Order Request Date:</strong> {{ orderDetails.order_request_date }}</p>
            <p><strong>Request Time Slot:</strong> {{ orderDetails.order_request_time_slot }}</p>
            <p><strong>Service Category:</strong> {{ orderDetails.service_category_name }}</p>
            <p><strong>Service Name:</strong> {{ orderDetails.service_name }}</p>
            <p v-if="feedbackContext === 'user_to_professional'"><strong>Professional Name:</strong> {{ orderDetails.professional_name }}</p>
            <p v-else><strong>User ID:</strong> {{ orderDetails.user_id }}</p>
            <p><strong>Status:</strong> {{ orderDetails.order_status }}</p>
            <p><strong>Cost of Order:</strong> ₹{{ orderDetails.cost_of_order }}</p>
        </div>

        <div>
            <h2>Provide Your Feedback</h2>
            <label for="ratings">Ratings (1 to 5):</label>
            <select v-model="ratings" id="ratings" class="form-select">
                <option value="" disabled>Select Rating</option>
                <option v-for="i in 5" :value="i" :key="i">{{ i }}</option>
            </select>

            <label for="remarks">Remarks:</label>
            <textarea v-model="remarks" id="remarks" class="form-control" placeholder="Write your review"></textarea>

            <button class="btn btn-primary mt-3" @click="submitFeedback">Submit Feedback</button>
        </div>
    </div>
    `,
    props: {
        orderId: { type: String, required: true },
        feedbackContext: { type: String, default: "user_to_professional" },
    },
    data() {
        return {
            loggedInUserId: sessionStorage.getItem("userId"),
            orderDetails: {}, // Order details fetched from the backend
            ratings: null,    // For storing selected rating
            remarks: "",      // For storing entered remarks
            feedbackContext: "user_to_professional", // Default feedback context
        };
    },
    methods: {
        async fetchOrderDetails(orderId) {
            try {
                console.log("Fetching details for orderId:", orderId);

                const response = await fetch(`/feedback/order/${orderId}`);
                const data = await response.json();

                console.log("Response data:", data);

                if (response.ok) {
                    this.orderDetails = data;
                    console.log("Order details set to:", this.orderDetails);
                } else {
                    alert(data.error || "Failed to fetch order details.");
                }
            } catch (error) {
                console.error("Error fetching order details:", error);
            }
        },
        async submitFeedback() {
            if (!this.ratings || !this.remarks.trim()) {
                alert("Please provide both ratings and remarks.");
                return;
            }
        
            console.log("Submitting feedback with data:", {
                order_id: this.orderDetails.order_id,
                review_by_id: this.feedbackContext === "user_to_professional" 
                              ? this.orderDetails.user_id 
                              : this.orderDetails.professional_id,
                review_for_id: this.feedbackContext === "user_to_professional" 
                               ? this.orderDetails.professional_id 
                               : this.orderDetails.user_id,
                review_type: this.feedbackContext,
                ratings: this.ratings,
                remarks: this.remarks.trim(),
            });
        
            try {
                const response = await fetch("/submit_feedback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        order_id: this.orderDetails.order_id,
                        review_by_id: this.feedbackContext === "user_to_professional" 
                                      ? this.orderDetails.user_id 
                                      : this.orderDetails.professional_id,
                        review_for_id: this.feedbackContext === "user_to_professional" 
                                       ? this.orderDetails.professional_id 
                                       : this.orderDetails.user_id,
                        review_type: this.feedbackContext,
                        ratings: this.ratings,
                        remarks: this.remarks.trim(),
                    }),
                });
        
                const result = await response.json();
                if (result.error) {
                    alert(result.error);
                } else {
                    alert("Feedback submitted successfully!");
        
                    // Redirect based on feedback context
                    if (this.feedbackContext === "user_to_professional") {
                        this.$router.push({ name: "user-home" });
                    } else if (this.feedbackContext === "professional_to_user") {
                        this.$router.push({ name: "professional-home" });
                    }
                }
            } catch (error) {
                console.error("Error submitting feedback:", error);
            }
        }
        ,
        getQueryParam(param) {
            // Helper method to fetch query parameters from the URL
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(param);
        },
    },
    mounted() {
        // Extract parameters from the route or query string
    const orderId = this.$route.params.orderId || this.getQueryParam("orderId");
    const feedbackContext =
        this.$route.params.feedbackContext ||
        this.getQueryParam("feedbackContext") ||
        "user_to_professional";

    // Debugging logs to ensure values are being fetched correctly
    console.log("Order ID from route or query:", orderId);
    console.log("Feedback context from route or query:", feedbackContext);

    if (!orderId) {
        alert("Invalid order ID. Cannot fetch order details.");
        return;
    }

    // Assign fetched values to component's data
    this.feedbackContext = feedbackContext;
    this.fetchOrderDetails(orderId);
    },
};
