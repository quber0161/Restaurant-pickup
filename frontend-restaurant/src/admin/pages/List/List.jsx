/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useContext } from 'react'
import { useOutletContext } from 'react-router-dom'
import './List.css'
import axios from 'axios'
import { toast } from 'react-toastify'
const List = () => {
  const { url, token, restaurantSlug } = useOutletContext();
  const [list, setList] = useState([]);

  const fetchList = async () => {
    const q = restaurantSlug ? `?slug=${restaurantSlug}` : "";
    const response = await axios.get(`${url}/api/food/list${q}`, { headers: { token } });
    if (response.data.success) {
      setList(response.data.data);
    }
    else {
      toast.error("Error")
    }
  }

  const removeFood = async (foodId) => {
    const removed = list.find((f) => f._id === foodId);
    setList((prev) => prev.filter((f) => f._id !== foodId));
    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: foodId }, { headers: { token } });
      if (response.data.success) toast.success(response.data.message);
      else {
        toast.error("Error");
        if (removed) setList((prev) => [...prev, removed].sort((a, b) => 0));
      }
    } catch {
      toast.error("Error");
      if (removed) setList((prev) => [...prev, removed]);
    }
  };

  const toggleSoldOut = async (foodId, currentStatus) => {
    const newStatus = !currentStatus;
    setList((prev) => prev.map((f) => (f._id === foodId ? { ...f, isSoldOut: newStatus } : f)));
    try {
      const response = await axios.post(`${url}/api/food/update-soldout`, {
        foodId,
        isSoldOut: newStatus
      }, { headers: { token } });
      if (response.data.success) toast.success("Sold out status updated");
      else {
        setList((prev) => prev.map((f) => (f._id === foodId ? { ...f, isSoldOut: currentStatus } : f)));
        toast.error("Failed to update status");
      }
    } catch {
      setList((prev) => prev.map((f) => (f._id === foodId ? { ...f, isSoldOut: currentStatus } : f)));
      toast.error("Error updating sold out status");
    }
  };
  

  useEffect(() => {
    fetchList();
  }, [restaurantSlug])

  return (
    <div className='list add flex-col'>
      <p>All Foods List</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Sold Out</b>
          <b>Action</b>
        </div>
        {list.map((item,index)=>{
          return(
            <div key={index} className='list-table-format'>
              <img src={item.image?.startsWith?.("http") ? item.image : `${url}/foodimages/` + item.image} alt="" />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>{item.price}</p>
              <p>
                <button
                  className={`li-button`}
                  style={{
                    background: item.isSoldOut ? "#ffc107" : "#198754"
                  }}
                  onClick={() => toggleSoldOut(item._id, item.isSoldOut)}
                >
                  {item.isSoldOut ? "Mark In" : "Sold Out"}
                </button>
              </p>
              <button onClick={()=>removeFood(item._id)} className='li-button'>Remove</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default List
