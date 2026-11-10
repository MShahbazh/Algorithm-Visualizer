import type { Dispatch, SetStateAction } from "react"


interface HomeProps {
  setHome: Dispatch<SetStateAction<boolean>>;
  setAlgo:Dispatch<SetStateAction<boolean>>;
}

export default function Home({setHome,setAlgo}:HomeProps){
    return(
        <div className="bg-paper flex items-center flex-col gap-5 justify-center p-10 w-full">
            <div className="flex items-center justify-center text-4xl font-display font-bold py-10  w-full">
                <h1>Divide and Conquer Algorithms</h1>
            </div>
            <hr  className="h-0 border-b-black w-[60%]"/>
            <div className=" flex items-center justify-center font-display py-5 flex-col gap-5 w-full">
                <div onClick={()=>{
                    setHome(false) 
                    setAlgo(true)
                    }} className="group flex items-center justify-center flex-row  cursor-pointer hover:bg-surface w-[60%] py-7 border rounded">
                    <h1 className="group-hover:text-clay text-4xl flex items-start justify-center w-[20%]">01</h1>
                    <h1 className="text-2xl  flex items-start justify-start w-[60%] ">Closest Pair of Points</h1>
                    <h1 className=" text-md font-ui text-forest font-bold flex items-end justify-center w-[20%]">Open</h1>
                </div>
                <div onClick={()=>{
                    setHome(false)
                    setAlgo(false)
                }} className="group flex items-center justify-center flex-row  cursor-pointer hover:bg-surface w-[60%] py-7 border rounded ">
                    <h1 className="group-hover:text-clay text-4xl flex items-start justify-center w-[20%]">02</h1>
                    <h1 className="text-2xl  flex items-start justify-start w-[60%] ">Integer Multiplication</h1>
                    <h1 className=" text-md font-ui text-forest font-bold flex items-end justify-center w-[20%]">Open</h1>
                </div>
            </div>
        </div>
    )
}