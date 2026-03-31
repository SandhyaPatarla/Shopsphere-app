import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface CartItem{
  id: string,
  name: string,
  price: number,
  category:string,
  image:string
  quantity: number  
}

interface CartState{
    items: CartItem[],
    totalQuantity:number,
    totalPrice:number
}

const initialState:CartState={
    items:[],
    totalQuantity:0,
    totalPrice:0
}

const cartSlice=createSlice({
    name:"cart",
    initialState,
    reducers:{
        addToCart:(state,action:PayloadAction<Omit<CartItem,"quantity">>)=>{
            const item=action.payload
            const existingItem=state.items.find(i=> i.id===item.id)
            if(existingItem){
                existingItem.quantity+=1
            }else{
                state.items.push({...item, quantity:1})
            }
            state.totalQuantity+=1
            state.totalPrice+=item.price
        }
    },
})

export const {addToCart} = cartSlice.actions
export default cartSlice.reducer