/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import './List.css'
import axios from 'axios'
import { toast } from 'react-toastify'

const List = () => {

  const url = "https://restaurant-pickup-1.onrender.com"
  const [list, setList] = useState([]);

  const fetchList = async () => {
    const response = await axios.get(`${url}/api/food/list`);
    if (response.data.success) {
      setList(response.data.data);
    }
    else {
      toast.error("Error")
    }
  }

  const removeFood = async(foodId) => {
    const response = await axios.post(`${url}/api/food/remove`,{id:foodId})
    await fetchList();
    if (response.data.success) {
      toast.success(response.data.message)      
    }
    else{
      toast.error("Error");
    }
  }

  const toggleSoldOut = async (foodId, currentStatus) => {
    try {
      const response = await axios.post(`${url}/api/food/update-soldout`, {
        foodId,
        isSoldOut: !currentStatus
      });
  
      if (response.data.success) {
        toast.success("Sold out status updated");
        fetchList(); // Refresh list
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Error updating sold out status");
    }
  };
  

  useEffect(() => {
    fetchList();
  }, [])

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
              <img src={`${url}/foodimages/`+item.image} alt="" />
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
