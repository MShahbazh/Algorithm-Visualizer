import { useState } from "react"
import Home from "./components/Home"
import Algos from "./components/Algos"


export default function App(){

  const [home,setHome]=useState(true)
  const [algo,setAlgo]=useState<boolean>(true)

  return(
      <>
      <div className="flex items-center justify-between font-mono p-5 bg-paper border-b-black border-b">
        <h1 className="p-2">DAA Project</h1>
        {
          home?
          null:
          <h1 onClick={()=>{setHome(!home)}} className="p-2 bg-clay text-white rounded cursor-pointer hover:-translate-y-0.5 hover:-translate-x-0.5 transition duraton-150">Back to Home</h1>
        }
      </div>
      {
        home?
        <Home setHome={setHome} setAlgo={setAlgo}/>
        :
        <Algos name={algo}/>
      }
      </>
  )
}