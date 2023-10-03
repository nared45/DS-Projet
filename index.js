// Require dependencies ต่าง ๆ ที่ต้องใช้

const express = require('express'); //สร้างเส้นทาง (routes), จัดการข้อมูลที่ส่งผ่าน HTTP request, สร้าง API
const path = require('path'); // ช่วยในการสร้าง path ที่ถูกต้องสำหรับไฟล์และโฟลเดอร์ต่าง ๆ ในแอป
const cookieSession = require('cookie-session'); //middleware สำหรับ Express สามารถเก็บข้อมูล session ของผู้ใช้ในรูปแบบคุกกี้บนเบราว์เซอร์
const bcrypt = require('bcrypt'); // เป็นโมดูลที่ใช้ในการเข้ารหัสและตรวจสอบรหัสผ่าน ช่วยเรื่องความปลอดภัยของรหัสผ่านโดยการเข้ารหัสแบบ hash
const dbConnection = require('./database'); // module หรือไฟล์ที่สร้างขึ้นเองเพื่อจัดการการเชื่อมต่อกับฐานข้อมูล
const { body, validationResult, Result } = require('express-validator'); // middleware สำหรับ Express ที่ช่วยในการตรวจสอบสำหรับข้อมูลที่ส่งผ่าน HTTP request


const app = express()
app.use(express.urlencoded({ extended: false}))

app.set('views',path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cookieSession({
    name: 'session',
    keys: ['key1','key2'],
    maxAge: 3600 * 1000 //hour
}))

// Declaring Custom Middleware
const ifNotLoggedIn = (req,res,next) => {
    if (!req.session.isLoggedIn){
        return res.render('login-register');
    }
    next();
}

const ifLoggedIn = (req,res,next) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/home');
    }
    next();
}

// route page
app.get('/', ifNotLoggedIn, (req, res, next) => {
    dbConnection.execute("SELECT user_username FROM users WHERE user_id = ?", [req.session.userID])
        .then(([rows]) => {
            dbConnection.execute("SELECT car_id, car_name, price_per_day, plat_number, Amount FROM car WHERE Amount = 1")
                .then(([carRows]) => {
                    res.render('home', {
                        name: rows[0].user_username,
                        id: rows[0].user_id,
                        cars: carRows 
                    });
                })
                .catch(err => {
                    if (err) throw err;
                });
        });
});

// Register page
app.post('/register', ifLoggedIn, [
    body('user_username', 'user_username is empty!').trim().not().isEmpty(),
    body('user_username').custom((value, { req }) => {
     return dbConnection.execute('SELECT user_username FROM users WHERE user_username = ?', [value])
     .then(([rows]) => {
         if (rows.length > 0) {
             return Promise.reject('This username is already in use');
         }
         return true;
     });
 }),
    body('user_firstname', 'name is empty!').trim().not().isEmpty(), 
    body('user_surname', 'Surname is empty!').trim().not().isEmpty(), 
    body('user_phonenumber', 'Invalid phone number').matches(/^\d{10}$/),
    body('user_phonenumber').custom((value, { req }) => {
        return dbConnection.execute('SELECT user_phonenumber FROM users WHERE user_phonenumber = ?', [value])
        .then(([rows]) => {
            if (rows.length > 0) {
                return Promise.reject('This Phone number is already in use');
            }
            return true;
        });
    }),
    body('user_password', 'The password must be of minimum length 6 character.').trim().isLength({min: 6}), 
 ], //end of validation
     (req, res, next) => {
         const validation_Result = validationResult(req);
         const {user_username,user_firstname,user_surname,user_password,user_phonenumber} = req.body;
 
         if (validation_Result.isEmpty()){
             bcrypt.hash(user_password, 12).then((hash_pass) => {
                 dbConnection.execute("INSERT INTO users (user_username,user_password,user_firstname,user_surname,user_phonenumber,user_type) VALUES(?,?,?,?,?,1)",
                 [user_username,hash_pass,user_firstname,user_surname,user_phonenumber]).then(result => {
                     res.send(`Your account has been create successfully, Now you can <a href="/">Login</a>`);
                 }).catch(err => {
                     if (err) throw err;
                 })
             }).catch(err => {
                 if (err) throw err;
             })
         } else{
             let allErrors = validation_Result.array().map((error) => {
                 return error.msg;
             })
 
             res.render('login-register', {
                 register_error: allErrors,
                 old_data: req.body
             })
         }
     })

// Login page
app.post('/', ifLoggedIn, [
    body('user_username').custom((value) => {
        return dbConnection.execute("SELECT user_username FROM users WHERE user_username = ?", [value])
        .then(([rows]) => {
            if (rows.length == 1){
                return true;
            }
            return Promise.reject('Invalid username!')
        });
    }),
    body('user_password', 'Password is empty').trim().not().isEmpty(),
], (req,res) => {
    const validation_Result = validationResult(req);
    const {user_username, user_password} = req.body;
    if (validation_Result.isEmpty()) {
        dbConnection.execute("SELECT * FROM users WHERE user_username = ?", [user_username])
        .then(([rows]) => {
            bcrypt.compare(user_password, rows[0].user_password).then(compare_result =>{
                if (compare_result === true){
                    req.session.isLoggedIn = true;
                    req.session.userID = rows[0].user_id;
                    res.redirect('/');
                } else{
                    // console.log('5555');
                    res.render('login-register',{
                        login_errors: ['Invalid Password']
                    })
                }
            }).catch(err => {
                if (err) throw err;
            })
        }).catch(err => {
            if (err) throw err;
        })
    } else {
        let allErrors = validation_Result.errors.map((error) => {
            return error.msg;
        })

        res.render('login-register', {
            login_errors: allErrors
        })
    }
})

// Logout
app.get('/logout', (req,res) => {
    //session destory
    req.session = null;
    res.redirect('/');
})

// Check reservation
app.get('/reservation', ifNotLoggedIn, (req, res, next) => {
    dbConnection.execute("SELECT reservation.reservation_id, reservation.user_id,users.user_username AS user_name, reservation.car_id, car.car_name AS car_name, reservation.start_date,reservation.end_date, reservation.total_cost FROM reservation JOIN users ON reservation.user_id = users.user_id JOIN car ON reservation.car_id = car.car_id WHERE reservation.user_id = ?", [req.session.userID])
        .then(([rows]) => {
            res.render('reservation', {
                reservations: rows
            });
        })
        .catch(err => {
            if (err) throw err;
        });
});

// reserve
app.get('/reserve/:car_id/:price_per_day', ifNotLoggedIn, [
    body('start_date', 'Start Date is required').trim().not().isEmpty(),
    body('end_date', 'End Date is required').trim().not().isEmpty(),
    body('total_cost', 'Total Cost is required').trim().not().isEmpty(),
], (req, res) => {
    const carId = req.params.car_id;
    const price_per_day = req.params.price_per_day
    const { start_date, end_date, total_cost } = req.body;
    const userId = req.session.userID;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('reserve', {
            car_id: carId,
            car_price_per_day: price_per_day,
            reserve_errors: errors.array()
        });
    }

    const sqlInsertReservation = "INSERT INTO reservation (user_id, car_id, start_date, end_date, total_cost) VALUES (?, ?, ?, ?, ?)";
    const sqlUpdateCarAmount = "UPDATE car SET Amount = 0 WHERE car_id = ?";
    
    dbConnection.beginTransaction((err) => {
        if (err) { throw err; }
        // เริ่มทำรายการธุรกรรม

        dbConnection.execute(sqlInsertReservation, [userId, carId, start_date, end_date, total_cost])
            .then(() => {
                // เมื่อทำการจองเสร็จสิ้น ให้ทำการอัปเดตค่า amount ในตาราง car เป็น 0
                return dbConnection.execute(sqlUpdateCarAmount, [carId]);
            })
            .then(() => {
                dbConnection.commit((err) => {
                    if (err) {
                        return dbConnection.rollback(() => {
                            throw err;
                        });
                    }
                    res.redirect('/reservation');
                });
            })
            .catch((err) => {
                dbConnection.rollback(() => {
                    if (err) throw err;
                });
            });
    });
});
app.post('/reserve/:car_id/:price_per_day', ifNotLoggedIn, [
    body('start_date', 'Start Date is required').trim().not().isEmpty(),
    body('end_date', 'End Date is required').trim().not().isEmpty(),
    body('total_cost', 'Total Cost is required').trim().not().isEmpty(),
], async (req, res) => { // เพิ่ม async ให้กับ callback function
    const carId = req.params.car_id;
    const price_per_day = req.params.price_per_day;
    const { start_date, end_date, total_cost } = req.body;
    const userId = req.session.userID;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('reserve', {
            car_id: carId,
            car_price_per_day: price_per_day,
            reserve_errors: errors.array()
        });
    }

    const sqlInsertReservation = "INSERT INTO reservation (user_id, car_id, start_date, end_date, total_cost) VALUES (?, ?, ?, ?, ?)";
    const sqlUpdateCarAmount = "UPDATE car SET Amount = 0 WHERE car_id = ?";

    const connection = await dbConnection.getConnection(); // รับการเชื่อมต่อจาก pool

    try {
        await connection.beginTransaction(); // เริ่มทำรายการธุรกรรม

        await connection.execute(sqlInsertReservation, [userId, carId, start_date, end_date, total_cost]);
        await connection.execute(sqlUpdateCarAmount, [carId]);

        await connection.commit(); // ยืนยันการทำรายการ
        res.redirect('/reservation');
    } catch (err) {
        await connection.rollback(); // ยกเลิกรายการทั้งหมดในกรณีข้อผิดพลาด
        throw err;
    } finally {
        connection.release(); // คืนการเชื่อมต่อกลับไปยัง pool
    }
});

app.use('/', (req,res) => {
    res.status(404).send('<h1>404 Page Not Found!</h1>');
});

app.listen(3000, () => console.log('Server is running... '))
