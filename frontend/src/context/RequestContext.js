import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  getAllRequests, 
  getRequestById,
  createRequest, 
  updateRequest, 
  deleteRequest,
  getAllDeals, 
  createDeal,
  getNotifications,
  createNotification,
  markNotificationsRead
} from '../services/requestService';

const RequestContext = createContext();

export const useRequestContext = () => useContext(RequestContext);

export const RequestProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);
  const [acceptedDeals, setAcceptedDeals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedRequest, setInternalSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastInfo, setToastInfo] = useState({ show: false, message: '', bg: 'success' });

  const showToast = (message, bg = 'success') => {
    setToastInfo({ show: true, message, bg });
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking notifications read:', error);
    }
  };

  const fetchAllData = async () => {
    try {
      const [requestsData, dealsData] = await Promise.all([
        getAllRequests(),
        getAllDeals()
      ]);
      setRequests(requestsData);
      setAcceptedDeals(dealsData);
      await fetchNotifications();
      
      if (selectedRequest) {
        const freshCurrent = requestsData.find(r => r.id === selectedRequest.id || r._id === selectedRequest._id);
        if (freshCurrent) setInternalSelectedRequest(freshCurrent);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const data = await getAllRequests();
      setRequests(data);
      await fetchNotifications();
      if (selectedRequest) {
        const freshCurrent = data.find(r => r.id === selectedRequest.id || r._id === selectedRequest._id);
        if (freshCurrent) setInternalSelectedRequest(freshCurrent);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  useEffect(() => {
    fetchAllData();
    // Poll notifications every 15 seconds so acceptance alerts appear automatically
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectRequest = async (reqItem) => {
    if (!reqItem) {
      setInternalSelectedRequest(null);
      return;
    }
    try {
      const targetId = reqItem.id || reqItem._id;
      const freshData = await getRequestById(targetId);
      setInternalSelectedRequest(freshData);
    } catch (error) {
      setInternalSelectedRequest(reqItem);
    }
  };

  const clearSelectedRequest = () => setInternalSelectedRequest(null);

  const handleAddRequest = async (newReq) => {
    try {
      await createRequest(newReq);
      await fetchRequests();
      showToast('Post published successfully', 'success');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to save post to backend.';
      showToast(`Error: ${errorMessage}`, 'danger');
      throw error;
    }
  };

  const handleDeleteRequest = async (id) => {
    try {
      await deleteRequest(id);
      await fetchRequests();
      setInternalSelectedRequest(null);
      showToast('Request deleted successfully.', 'success');
    } catch (error) {
      showToast('Failed to delete request', 'danger');
    }
  };

  const handleUpdatePost = async (id, updatedData) => {
    try {
      const updatedDoc = await updateRequest(id, updatedData);
      await fetchRequests();
      if (selectedRequest) setInternalSelectedRequest(updatedDoc);
      showToast('Post updated successfully!', 'success');
    } catch (error) {
      showToast('Failed to update post', 'danger');
    }
  };

  const handleAcceptOffer = async (reqId, acceptedOffer) => {
    try {
      const targetReq = requests.find(r => r.id === reqId || r._id === reqId);
      
      const newDealPayload = {
        requestId: reqId,
        requestTitle: targetReq?.title || 'Crop Request',
        sender: acceptedOffer.sender || 'Registered Partner',
        offeredPrice: Number(acceptedOffer.offeredPrice),
        quantityOffered: Number(acceptedOffer.quantityOffered),
        deliveryDate: acceptedOffer.deliveryDate,
        remarks: acceptedOffer.remarks
      };

      const savedDeal = await createDeal(newDealPayload);
      setAcceptedDeals(prev => [savedDeal, ...prev]);

      if (targetReq) {
        // Keep the offer in history and update its status to 'Accepted'
        let matchedOnce = false;
        const updatedOffers = (targetReq.offers || []).map(o => {
          const isMatch =
            !matchedOnce &&
            (o.status || 'Pending') === 'Pending' &&
            o.sender === acceptedOffer.sender &&
            Number(o.offeredPrice) === Number(acceptedOffer.offeredPrice) &&
            Number(o.quantityOffered) === Number(acceptedOffer.quantityOffered);

          if (isMatch) {
            matchedOnce = true;
            return { ...o, status: 'Accepted' };
          }
          return o;
        });
        
        const currentQty = Number(targetReq.quantity || 0);
        const acceptedQty = Number(acceptedOffer.quantityOffered || 0);
        const newQuantity = Math.max(0, currentQty - acceptedQty);

        const newStatus = newQuantity === 0 
          ? `Fully Fulfilled 🤝 (LKR ${acceptedOffer.offeredPrice})` 
          : `Partial Match 🤝 (${newQuantity} kg remaining)`;

        const payload = {
          ...targetReq,
          quantity: newQuantity,
          status: newStatus,
          offers: updatedOffers
        };

        const updatedDoc = await updateRequest(reqId, payload);
        setRequests(prev => prev.map(r => (r.id === reqId || r._id === reqId ? updatedDoc : r)));
        setInternalSelectedRequest(updatedDoc);

        // Send notification to the offer sender
        if (acceptedOffer.senderId || acceptedOffer.sender) {
          await createNotification({
            recipientId: acceptedOffer.senderId || acceptedOffer.sender,
            recipientName: acceptedOffer.sender,
            title: 'Offer Accepted! 🎉',
            message: `${targetReq.buyerName || 'Post Owner'} accepted your offer of LKR ${acceptedOffer.offeredPrice}/kg (${acceptedOffer.quantityOffered} kg) for ${targetReq.title} (${targetReq.id}).`,
            requestId: targetReq.id
          });
        }
        
        await fetchAllData();
      }
      showToast('🎉 Offer Accepted & Receipt Generated!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to accept offer and save deal', 'danger');
    }
  };
    
  const handleDeclineOffer = async (reqId, declinedOffer) => {
    try {
      const targetReq = requests.find(r => r.id === reqId || r._id === reqId);
      if (targetReq) {
        let matchedOnce = false;
        const updatedOffers = (targetReq.offers || []).map(o => {
          const isMatch =
            !matchedOnce &&
            (o.status || 'Pending') === 'Pending' &&
            o.sender === declinedOffer.sender &&
            Number(o.offeredPrice) === Number(declinedOffer.offeredPrice) &&
            Number(o.quantityOffered) === Number(declinedOffer.quantityOffered);

          if (isMatch) {
            matchedOnce = true;
            return { ...o, status: 'Declined' };
          }
          return o;
        });
        
        const payload = { ...targetReq, offers: updatedOffers };
        const updatedDoc = await updateRequest(reqId, payload);
        
        setRequests(prev => prev.map(r => (r.id === reqId || r._id === reqId ? updatedDoc : r)));
        setInternalSelectedRequest(updatedDoc);
      }
      showToast('❌ Offer declined.', 'warning');
    } catch (error) {
      showToast('Failed to decline offer', 'danger');
    }
  };

  return (
    <RequestContext.Provider value={{
      requests,
      acceptedDeals,
      notifications,
      handleMarkNotificationsRead,
      selectedRequest,
      setSelectedRequest: handleSelectRequest,
      clearSelectedRequest,
      loading,
      toastInfo,
      setToastInfo,
      showToast,
      fetchRequests,
      fetchAllData,
      handleAddRequest,
      handleDeleteRequest,
      handleUpdatePost,
      handleAcceptOffer,
      handleDeclineOffer
    }}>
      {children}
    </RequestContext.Provider>
  );
};