import React from "react";
import axios from "axios";
const Dummy = () => {
  const handleClick = async () => {
    try {
      const response = await axios.get("http://localhost:3000/hi",);
      if (response.status === 200) {
        console.log(response);
        alert(response.data)
      }
    } catch (error) {}
  };

  return (
    <>
      <div className="container flex justify-center h-screen items-center">
        <input type="text" />
        <input type="text" />
      <button className='p-3 bg-red-400 text-blue-400 ' onClick={handleClick}>Click me</button>
      </div>
    </>
  );
};

export default Dummy;
