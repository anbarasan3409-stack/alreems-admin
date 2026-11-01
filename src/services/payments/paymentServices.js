import apiInstance from '@/api/apiInstance';

class PaymentService {
  async getAllPayments() {
    try {
      const response = await apiInstance.get('/admin/payments');
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  }

  async createPayment(paymentData) {
    try {
      const response = await apiInstance.post('/admin/payments', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment record:', error);
      throw error;
    }
  }

  async getAllSubscriptions() {
    try {
      const response = await apiInstance.get('/admin/subscriptions');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  }

  async getPaymentById(id) {
    try {
      const response = await apiInstance.get(`/admin/payments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  }

  async updatePaymentStatus(id, status) {
    try {
      const response = await apiInstance.put(`/admin/payments/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  async deletePayment(id) {
    try {
      const response = await apiInstance.delete(`/admin/payments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }
}

const paymentService = new PaymentService();

export default paymentService;
