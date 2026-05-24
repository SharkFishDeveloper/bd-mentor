
import express, { NextFunction } from "express";
import { Request, Response } from 'express';
import prisma from "../db";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../utils";

export interface CustomRequest extends Request{
    user?:any
}

const authMiddleware = async(req:CustomRequest,res:Response,next:NextFunction)=>{
    try {
        const token= req.cookies.token;
        console.log("Token",token);
       
    if(!token){
        return res.json({message:"Please sign in !!"})
    }
    const userID = jwt.verify(token,JWT_SECRET_KEY);
    
    const user  = await prisma.user.findFirst({
        where:{
            id:userID as string
        }
    })
    req.user = user;
    console.log("User",user);
    console.log("Authmiddelware cookie",token);
    next();
    } catch (error) {
        console.log("in middlw",error)
    }
}


const authMentorMiddleware = async(req:CustomRequest,res:Response,next:NextFunction)=>{
    try {
        const token= req.cookies.token;
        console.log("Token",token);
       
    if(!token){
        return res.json({message:"Please sign in !!"})
    }
    const userID = jwt.verify(token,JWT_SECRET_KEY);
    
    const user  = await prisma.mentor.findFirst({
        where:{
            id:userID as string
        }
    })
    req.user = user;
    console.log("Mentor",user);
    console.log("Authmiddelware cookie",token);
    next();
    } catch (error) {
        console.log("in mentor middw.",error)
    }
}


const initialUserRequest = async(req:CustomRequest,res:Response,next:NextFunction)=>{
    try {
        const token= req.cookies.token;
        console.log("Token",token);
       
    if(!token){
        return res.json({message:"Please sign in !!"})
    }
    const userID = jwt.verify(token,JWT_SECRET_KEY);
    if(!userID){
        return res.status(400).json({message:"No userID exists !!"})
    }
    const user  = await prisma.user.findFirst({
        where:{
            id:userID as string
        }
    })
    if(!user){
        return res.status(400).json({message:"No user exists !!"})
    }
    console.log("User",user);
    return res.json({message:"success",user:user})
    } catch (error) {
        console.log("in middlw",error)
        return res.json({message:"No user exists !!"})
    }
}


const initialMentorRequest = async(req:CustomRequest,res:Response,next:NextFunction)=>{
    try {
        const token= req.cookies.token;
        console.log("Token",token);
       
    if(!token){
        return res.json({message:"Please sign in !!"})
    }
    const userID = jwt.verify(token,JWT_SECRET_KEY);
    
    const user  = await prisma.mentor.findFirst({
        where:{
            id:userID as string
        }
    })
    if(!user){
        return res.status(400).json({message:"No mentor exists !!"})
    }
    return res.json({message:"success",user:user})
    } catch (error) {
        console.log("in mentor middw.",error)
        return res.json({message:"No mentor exists !!"})
    }
}


export {authMiddleware,authMentorMiddleware,initialMentorRequest,initialUserRequest};