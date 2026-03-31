import { ShoppingBag  } from 'lucide-react';

type Product={
    id:string,
    name:string,
    price:Number,
    category:string,
    image:string
}

type ProductCardProps={
    product:Product
}

export default function ProductCard({product}:ProductCardProps){
    const {id, name, price, category, image}= product
    return(
        <>
        <div  id={id} className="flex-col bg-white w-[50vh] h-[65vh]  rounded-lg">
            <img src={image} className="w-[100%] h-[65%] rounded-t-lg " />
            <div className="px-4 pt-4 flex-col">
                <div className="text-textMain font-bold">
                    {name}
                </div>
                <div className='text-accent'>
                   $ {price.toString()}
                </div>
                <div className="bg-yellow-50 rounded-lg p-[1px] inline-block px-2 text-sm">
                    {category}
                </div>
            </div>
            <div className='flex  bg-primary text-white p-2 mx-2 space-x-3 rounded-lg mt-2 cursor-pointer'>
                <ShoppingBag  />
                <p className='font-semibold'> Add to Cart </p>
            </div>
            
        </div>
        </>
    )
}