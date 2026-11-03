import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  getAllRequests, 
  getRequestById,
  createRequest, 
  updateRequest, 
  deleteRequest,
  getAllDeals, 
  createDeal
} from '../services/requestService';

const RequestContext = createContext();

export const useRequestContext = () => useContext(RequestContext);

export const RequestProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);
  const [acceptedDeals, setAcceptedDeals] = useState([]);
  const [selectedRequest, setInternalSelectedRequest] = useState(null); // Renamed to avoid recursion trap
  const [loading, setLoading] = useState(true);
  const [toastInfo, setToastInfo] = useState({ show: false, message: '', bg: 'success' });

  const showToast = (message, bg = 'success') => {
    setToastInfo({ show: true, message, bg });
  };

  const fetchAllData = async () => {
    try {
      const [requestsData, dealsData] = await Promise.all([
        getAllRequests(),
        getAllDeals()
      ]);
      setRequests(requestsData);
      setAcceptedDeals(dealsData);
      
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
  }, []);

  // Safe wrapper for selecting or clearing requests
  const handleSelectRequest = async (reqItem) => {
    if (!reqItem) {
      setInternalSelectedRequest(null); // Safely clears state
      return;
    }

    try {
      const targetId = reqItem.id || reqItem._id;
      const freshData = await getRequestById(targetId);
      setInternalSelectedRequest(freshData);
    } catch (error) {
      console.error('Error fetching single request:', error);
      setInternalSelectedRequest(reqItem);
    }
  };

  const clearSelectedRequest = () => {
    setInternalSelectedRequest(null);
  };

  const handleAddRequest = async (newReq) => {
    try {
      await createRequest(newReq);
      await fetchRequests();
      showToast('Post published successfully', 'success');
    } catch (error) {
      showToast('Failed to save post to backend.', 'danger');
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
        sender: acceptedOffer.sender || 'Current Logged In User',
        offeredPrice: Number(acceptedOffer.offeredPrice),
        quantityOffered: Number(acceptedOffer.quantityOffered),
        deliveryDate: acceptedOffer.deliveryDate,
        remarks: acceptedOffer.remarks
      };

      const savedDeal = await createDeal(newDealPayload);
      setAcceptedDeals(prev => [savedDeal, ...prev]);

      if (targetReq) {
        const updatedOffers = (targetReq.offers || []).filter(o => 
          !(o.offeredPrice === acceptedOffer.offeredPrice && 
            o.quantityOffered === acceptedOffer.quantityOffered && 
            o.remarks === acceptedOffer.remarks)
        );
        
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
        
        await fetchAllData();
      }
      showToast('🎉 Offer Accepted!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to accept offer and save deal', 'danger');
    }
  };
    
  const handleDeclineOffer = async (reqId, declinedOffer) => {
    try {
      const targetReq = requests.find(r => r.id === reqId || r._id === reqId);
      if (targetReq) {
        const updatedOffers = targetReq.offers.filter(o => o !== declinedOffer);
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