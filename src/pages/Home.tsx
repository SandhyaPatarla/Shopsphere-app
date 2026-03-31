import HeroSection from "../components/HeroSection"
import ProductCard from "../components/ProductCard"
import { products } from "../utils/products"
export default function Home(){
    return(
        <>
        <div className="flex-col bg-background ">
            <HeroSection />
            <div className="flex bg-background space-x-2 py-5">
            {products.map((pro)=>
                (
                    <ProductCard product={pro} />
                )
            )}
            </div>
        </div>
        
        </>
    )
}