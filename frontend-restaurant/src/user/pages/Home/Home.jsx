/* eslint-disable no-unused-vars */
import React, { useEffect} from "react";
import "./Home.css";
import Header from "../../components/Header/Header";

const Home = () => {

  useEffect(()=>{
    window.scrollTo(0,0);
  },[])

  return (
    <div>
      <Header />
    </div>
  );
};

export default Home;
