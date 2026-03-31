import { Link } from "react-router-dom";
import { ShoppingBag } from 'lucide-react';

export default function AppBar(){
    return(
        <>
        <nav className="bg-primary px-3 py-5">
            <div className="flex justify-between text-white">
                <div className="flex justify-start space-x-7 ">
                    <Link  to='/' >Home</Link>
                    <Link to="/productdetail">Product Detail</Link>
                </div>
                <div>
                    <ShoppingBag />
                </div>
            </div>
        </nav>
        </>
    )
}