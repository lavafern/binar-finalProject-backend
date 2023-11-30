const {prisma} = require("../utils/prismaClient")
const {ForbiddenError,BadRequestError, NotFoundError} = require("../errors/customErrors")

module.exports = {
    createCourse : async (req,res,next) => {
        try {
            const role = req.user.profile.role
            if (role !== 'ADMIN') throw new ForbiddenError("Kamu tidak memiliki akses kesini")

            let {
                title,price,level,isPremium,description,courseCategory,mentorEmail,code,groupUrl,thumbnailUrl
            } = req.body
            price = Number(price)

            if (isNaN(price)) throw new BadRequestError("Kolom harga harus diisi dengan angka")
            if (!title || !price || !level  || !description || !code || !groupUrl || !mentorEmail || !courseCategory || !thumbnailUrl) throw new BadRequestError("Tolong isi semua kolom")
            if (!(Array.isArray(courseCategory)) || !(Array.isArray(mentorEmail)) ) throw new BadRequestError("category dan email mentor harus array")
            if (!(isPremium === false || isPremium === true)) throw new BadRequestError("isPremium harus boolean")
            if (!(level === "BEGINNER" || level === "INTERMEDIATE" || level === "ADVANCED")) throw new BadRequestError("level tidak valid")
            if (description.length > 1024)  throw new BadRequestError("Deskripsi harus tidak lebih dari 1024 karakter")
            if (title.length > 60) throw new BadRequestError("Judul tidak boleh lebih dari 60 karakter")


            //check if code is exist 
            checkCode = await prisma.course.findUnique({
                where : {
                    code
                }
            })
            if (checkCode) throw new BadRequestError("Gunakan kode lain")

            
            // category data
            const courseCategoryForPrisma = courseCategory.map((c) => {
                return {name : c}
            })

            let categoryId = await prisma.category.findMany({
                where : {
                    OR : courseCategoryForPrisma
                }
            })

            const validCategory = categoryId.map((i) => {
                return i.name
            })
            categoryId = categoryId.map((i) => {
                return {categoryId : i.id}
            })



            // mentor data
            const mentorEmailForPrisma = mentorEmail.map((e) => {
                return {email : e}
            })

            let mentorId = await prisma.user.findMany({
                where : {
                    OR : mentorEmailForPrisma
                }
            })
            const mentorValidEmail = mentorId.map((i) => {
                return i.email
            })

            mentorId = mentorId.map((i) => {
                return {authorId : i.id}
            })


            
            // create new course
            const newCourse = await prisma.course.create({
                data : {
                    code,
                    title,
                    price,
                    level,
                    isPremium,
                    description,
                    groupUrl,
                    thumbnailUrl,
                    courseCategory : {
                        create : categoryId
                    },
                    mentor : {
                        create : mentorId
                    }
                    
                }
            })

            newCourse.mentor = mentorValidEmail
            newCourse.category = validCategory
            

            res.status(201).json({
                success : true,
                message : "succesfully create new course",
                data : newCourse
            })

        } catch (err) {
            next(err)
        }
    },

    updateCourse: async (req, res, next) => {
        try {
            const role = req.user.profile.role
            if (role !== 'ADMIN') throw new ForbiddenError("Kamu tidak memiliki akses kesini")

            let courseId = req.params.id;
            let {
                code, title, price, level, isPremium, description, courseCategory, mentorEmail,groupUrl
            } = req.body;

            price = Number(price);
            courseId = Number(courseId);

            if (isNaN(courseId)) throw new BadRequestError("Id harus diisi dengan angka")
            if (isNaN(price)) throw new BadRequestError("Kolom harga harus diisi dengan angka")
            if (!title || !price || !level  || !description || !code || !groupUrl || !mentorEmail || !courseCategory) throw new BadRequestError("Tolong isi semua kolom")
            if (!(Array.isArray(courseCategory)) || !(Array.isArray(mentorEmail)) ) throw new BadRequestError("category dan email mentor harus array")
            if (!(isPremium === false || isPremium === true)) throw new BadRequestError("isPremium harus boolean")
            if (!(level === "BEGINNER" || level === "INTERMEDIATE" || level === "ADVANCED")) throw new BadRequestError("level tidak valid")
            if (description.length > 1024)  throw new BadRequestError("Deskripsi harus tidak lebih dari 1024 karakter")
            if (title.length > 60) throw new BadRequestError("Judul tidak boleh lebih dari 60 karakter")

            //check course is exist
            const checkCourse = await prisma.course.findUnique({
                where : {
                    id : courseId
                }
            })
            if (!checkCourse)throw new NotFoundError("Course tidak ditemukan")

            // category data
            const courseCategoryForPrisma = courseCategory.map((c) => {
                return { name: c };
            });

            let categoryId = await prisma.category.findMany({
                where: {
                    OR: courseCategoryForPrisma,
                },
            });

            const validCategory = categoryId.map((i) => {
                return i.name;
            });
            categoryId = categoryId.map((i) => {
                return { categoryId: i.id };
            });

            // mentor data
            const mentorEmailForPrisma = mentorEmail.map((e) => {
                return { email: e };
            });

            let mentorId = await prisma.user.findMany({
                where: {
                    OR: mentorEmailForPrisma,
                },
            });
            const mentorValidEmail = mentorId.map((i) => {
                return i.email;
            });

            mentorId = mentorId.map((i) => {
                return { authorId: i.id };
            });
            //delete category
            await prisma.courseCategory.deleteMany({
                 where: {
                    courseId: courseId
                }
            })
             //delete mentor
            await prisma.mentor.deleteMany({
                where: {
                   courseId: courseId
               }
            })

            // update course
            const updatedCourse = await prisma.course.update({
                where: {
                    id: courseId,
                },
                data: {
                    title,
                    price,
                    level,
                    isPremium,
                    description,
                    groupUrl,
                    courseCategory : {
                        create : categoryId
                    },
                    mentor : {
                        create : mentorId
                    }

                },
            });

            updatedCourse.mentor = mentorValidEmail;
            updatedCourse.category = validCategory;

            res.status(201).json({
                success: true,
                message: "Successfully update course",
                data: updatedCourse,
            });
        } catch (err) {
            next(err);
        }
    },
    
    deleteCourse: async (req, res, next) => {
        try {
            const role = req.user.profile.role
            if (role !== 'ADMIN') throw new ForbiddenError("Kamu tidak memiliki akses kesini")
            
            let { id } = req.params
            if (!id) throw new BadRequestError("Id tidak boleh kosong")

            id = Number(id)
            if (isNaN(id)) throw new BadRequestError("Id harus angka")

            //check course is exist
            const checkCourse = await prisma.course.findUnique({
                where : {
                    id 
                }
            })
            if (!checkCourse)throw new NotFoundError("Course tidak ditemukan")


            let deleteCourse = await prisma.course.delete({
                where: { 
                    id
                 }
            });

            res.status(200).json({
                status: true,
                message: 'Successfully delete course',
                data: deleteCourse
            });

        } catch (err) {
            next(err);
        }
    },

};

