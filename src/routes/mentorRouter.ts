import express from "express";
import prisma from "../db";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../utils";
import bcrypt from "bcrypt";
import { CustomRequest, authMentorMiddleware, authMiddleware, initialMentorRequest } from "../middleware/authMiddleware";
import { forEachChild } from "typescript";
//! add zod for signup and login for both mentor and user

interface UpdateMentor {
    username?:string,
    imageUrl?:string,
    university?:string,
    specializations?:string[],
    timeslots?:number[],
    price? :number,
    about?:string
}


const mentorRouter = express.Router();

mentorRouter.get("/",initialMentorRequest);

mentorRouter.post("/login",async(req,res)=>{
    try {
        const {password,email} = req.body;
        if(!email||!password){
            return res.status(400).json({message:"Invalid email or password"});
        }
    const user = await prisma.mentor.findUnique({
        where:{
            email
        }
    })
    if(!user){return res.json({message:"User does not exist"})}
        const comparePassword = await bcrypt.compare(password,user.password);
    if(!comparePassword){
        return res.json({message:"Invalid password"})
    }else{
        const token = await jwt.sign(user.id,JWT_SECRET_KEY);
        res.cookie('token',token,{httpOnly:true,secure:true,sameSite:"none",maxAge:3600000})
        return res.json({message:"Logged in successfully !!",user:user})

    }
    } catch (error) {
     console.log(error);   
    }
    finally{
        prisma.$disconnect();
    }
})

mentorRouter.post("/signup",async(req,res)=>{
    const {username,password,email} = req.body;
    try {
        const findUSer = await prisma.mentor.findMany({
            where:{
                email,
                username
            }
        })
        if(findUSer.length > 0){
            return res.status(400).json({message:"User already exists !!"})
        }
        const cryptedPassword =await bcrypt.hash(password,10);
        const user = await prisma.mentor.create({
            data:{username,password:cryptedPassword,email},
        })
        const token = await jwt.sign(user.id,JWT_SECRET_KEY);
        res.cookie('token',token,{httpOnly:true,secure:true,sameSite:"none",maxAge:3600000})
        return res.json({message:"Success, signup",user:user})
    } catch (error) {
        console.log("error in db",error);
        return res.json({message:"Failed, signup"})
    }
    finally{
        prisma.$disconnect();
    }
})



mentorRouter.post("/search",authMiddleware,async(req,res)=>{
    try {
        const {username:searchname,selectedTags:specializations,university}:{username:string|undefined,selectedTags:string[]|undefined,university:string|undefined}= req.body;

            if(!searchname && !specializations?.length && !university) {
            return res.status(303).json({ message: "No search criteria provided!" });
            }
         
            console.log("USERNAME",searchname,specializations,university)  
            const whereConditions: any = {};

            if(searchname) {
                whereConditions.username = { contains:searchname, mode: 'insensitive',};
            }
            if (specializations && specializations.length > 0) {
                whereConditions.specializations = { hasEvery: specializations };
            }
            if (university) {
                whereConditions.university = { contains: university, mode: 'insensitive', };
            }

          const users = await prisma.mentor.findMany({
            where: whereConditions,
            take: 10, // Limit the results to the best matching 10 mentors
        });

        console.log("mentor users",)
    return res.json({message:`success`,users:users})
    } catch (error) {

      console.log(error);

      return res.status(500).json({
        message: "Failed to fetch meetings",
      });
    }
  }
);

mentorRouter.get(
  "/meetings/:id",
  authMiddleware,
  async (req, res) => {

    try {

      const mentorId = req.params.id;

      console.log("mentor id", mentorId);

      const mentor = await prisma.mentor.findUnique({
        where: {
          id: mentorId,
        },

        include: {
          meetings: {
            orderBy: {
              scheduledAt: "desc",
            },
          },
        },
      });

      if (!mentor) {
        return res.status(404).json({
          message: "No mentor found",
        });
      }

      return res.json({
        meetings: mentor.meetings,
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        message: "Failed to fetch meetings",
      });
    }
  }
);




mentorRouter.put("/update",authMentorMiddleware,async(req:CustomRequest,res)=>{

    try {
    const {price,username,imageUrl,university,specializations,timeslots,about}:UpdateMentor= req.body;

    const mentorDataToUpdate:UpdateMentor = {};
    if (username) mentorDataToUpdate.username = username;
    if (imageUrl) mentorDataToUpdate.imageUrl = imageUrl;
    if (university) mentorDataToUpdate.university = university;
    if (specializations) {
        mentorDataToUpdate.specializations = specializations.map(specialization => specialization.trim()).filter(specialization => specialization.length > 0);
    }

    if (specializations) mentorDataToUpdate.price = price;

    if(timeslots){
        timeslots.sort((a, b) => a - b);
        for (let i = 0; i < timeslots.length; i++) {
            if(timeslots[i] - timeslots[i-1] <=1 ){
                return res.status(300).json({message:"Time slots are too close. Keep difference of atleast 2 !!"})
            }
        }
        mentorDataToUpdate.timeslots = timeslots;
    };
    console.log("UPDATE DATA",mentorDataToUpdate)
    const userId = req.user;
    const userUpdated = await prisma.mentor.update({
        where:{
            id:userId 
        },
        data:mentorDataToUpdate
    })
    console.log(userUpdated);
    return res.json({message:"Success",user:userUpdated})
    } catch (error) {
        console.log("Mentor update error",error)
        return res.status(405).json({message:"Mentor update failed !!"})
    }
})


mentorRouter.get(
  "/reviews/:mentorId",
  authMiddleware,
  async (req, res) => {

    try {

      const { mentorId } = req.params;

      const reviews = await prisma.review.findMany({
        where: {
          mentorId,
        },

        include: {
          user: {
            select: {
              id: true,
              username: true,
              imageUrl: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

      return res.json({
        reviews,
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        message: "Failed to fetch reviews",
      });
    }
  }
);

mentorRouter.post(
  "/review/:mentorId",
  authMiddleware,
  async (req: CustomRequest, res) => {
    try {

      const { mentorId } = req.params;

      const { rating, comment } = req.body;

      const userId = req.user.id;

      // VALIDATION
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          message: "Rating must be between 1 and 5",
        });
      }

      if (!comment || comment.trim() === "") {
        return res.status(400).json({
          message: "Comment is required",
        });
      }

      // CHECK MENTOR EXISTS
      const mentorExists = await prisma.mentor.findUnique({
        where: {
          id: mentorId,
        },
      });

      if (!mentorExists) {
        return res.status(404).json({
          message: "Mentor not found",
        });
      }

      // CREATE OR UPDATE REVIEW
     await prisma.review.upsert({
  where: {
    userId_mentorId: {
      userId,
      mentorId,
    },
  },

  update: {
    rating,
    comment,
  },

  create: {
    rating,
    comment,
    userId,
    mentorId,
  },
});

const review = await prisma.review.findFirst({
  where: {
    userId,
    mentorId,
  },

  include: {
    user: {
      select: {
        id: true,
        username: true,
        imageUrl: true,
      },
    },
  },
});

      // RECALCULATE AVG RATING
      const allReviews = await prisma.review.findMany({
        where: {
          mentorId,
        },
      });

      const avgRating =
        allReviews.reduce((acc, curr) => {
          return acc + curr.rating;
        }, 0) / allReviews.length;

      // UPDATE MENTOR RATING
      await prisma.mentor.update({
        where: {
          id: mentorId,
        },

        data: {
          rating: Number(avgRating.toFixed(1)),
        },
      });

      return res.json({
        message: "Review added successfully",
        review,
      });

    } catch (error) {

      console.log("Review error", error);

      return res.status(500).json({
        message: "Failed to add review",
      });
    }
  }
);

export {mentorRouter};