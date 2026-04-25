import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { setCredentials } from '../store/slices/authSlice';
import registerBg from '../assets/register img.png';
import logoImg from '../assets/output-onlinepngtools.png';

const Register = () => {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState('Student');
  const [board, setBoard] = useState('');
  const [className, setClassName] = useState('');
  const [error, setError]       = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [availableClasses, setAvailableClasses] = useState([]);

  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const { data } = await axios.get('/student/catalog');
        // Extract unique class names/levels from both bundles and subjects
        // We want to show "Class 6", "Class 11", etc.
        const classes = data.map(item => item.className);
        const uniqueClasses = [...new Set(classes)].filter(Boolean).sort((a, b) => {
          const numA = parseInt(a.replace(/\D/g, '')) || 0;
          const numB = parseInt(b.replace(/\D/g, '')) || 0;
          return numA - numB;
        });
        setAvailableClasses(uniqueClasses);
      } catch (err) {
        console.error('Failed to fetch classes for registration', err);
      }
    };
    fetchCatalog();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res  = await axios.post('/auth/register', { name, email: email.toLowerCase(), password, role, board, className });
      const user = res.data;
      dispatch(setCredentials({ ...user }));
      const userRole = user?.role?.toLowerCase() || 'student';
      if (userRole === 'admin')        navigate('/admin/dashboard');
      else if (userRole === 'teacher') navigate('/teacher/dashboard');
      else                             navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <>
      <style>{`
        /* ── Reset ── */
        html, body, #root {
          margin: 0; padding: 0;
          width: 100%; height: 100%;
          overflow: hidden;
        }
        * { box-sizing: border-box; }

        .reg-container {
          width: 100vw;
          height: 100vh;
          background: #f0f2f5; 
          display: flex;
        }

        .reg-left-side {
          width: 60%;
          height: 100vh;
          display: flex;
          align-items: center;    /* Leaves equal gap top and bottom (10vh each side for 80vh card) */
          justify-content: flex-end; /* Attaches exactly to the right blue part */
          padding-left: 10%;      /* Leaves 10% gap on the left */
        }

        .reg-left-side-card {
          width: 100%;
          height: 80vh;
          background: #ccc;
          border-radius: 20px 0 0 20px; /* Left edges curved only */
          overflow: hidden;
          position: relative;
        }

        .reg-left-side-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .reg-right-side {
          width: 40%;
          height: 100vh;
          background: #002855; /* Project theme blue */
          display: flex;
          align-items: center;    /* Leaves 10vh top, 10vh bottom */
          justify-content: flex-start; /* Connects smoothly to the left card */
          padding-right: 8%;      /* Leaves 8% gap on the right */
        }

        .reg-right-side-card {
          width: 100%;
          height: 80vh;
          background: #002855; 
          border-radius: 0 20px 20px 0; /* Right edges curved */
          box-shadow: 12px 15px 35px rgba(0, 0, 0, 0.4); 
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 15px 30px;
          overflow-y: auto;
        }

        .reg-right-side-card::-webkit-scrollbar { width: 6px; }
        .reg-right-side-card::-webkit-scrollbar-track { background: transparent; }
        .reg-right-side-card::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }

        .reg-form-inner {
          width: 100%;
          max-width: 320px;
          display: flex;
          flex-direction: column;
        }

        .reg-logo {
          display: block;
          height: 90px; 
          margin: 0 auto 10px auto;
          object-fit: contain;
          transition: transform 0.2s;
        }
        .reg-logo:hover {
          transform: scale(1.05);
        }

        .reg-input-group {
          margin-bottom: 12px;
          width: 100%;
        }

        .reg-input-group input, .reg-input-group select {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.4);
          color: white;
          font-size: 13px;
          padding: 4px 0;
          outline: none;
        }

        .reg-input-group input::placeholder {
          color: white;
          opacity: 0.9;
        }
        
        .reg-input-group select {
           appearance: none; 
           color: white;
        }
        
        .reg-input-group select option {
           background: #002855;
           color: white;
        }

        /* Checkbox */
        .reg-checkbox-group {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .reg-checkbox-group input {
          width: 15px;
          height: 15px;
          cursor: pointer;
        }

        .reg-checkbox-group label {
          color: white;
          font-size: 12px;
          cursor: pointer;
        }
        
        .reg-checkbox-group label span {
          text-decoration: underline;
          font-weight: bold;
        }

        /* Button */
        .reg-submit-btn {
          width: 100%;
          background-color: #e84c3d;
          color: white;
          border: none;
          padding: 10px;
          border-radius: 5px;
          font-weight: bold;
          font-size: 13px;
          cursor: pointer;
          letter-spacing: 1px;
          margin-bottom: 15px;
          transition: background 0.2s, transform 0.1s;
        }
        .reg-submit-btn:hover { background: #d03d2e; }
        .reg-submit-btn:active { transform: scale(0.98); }

        /* Login link */
        .reg-login-link-container {
          text-align: center;
        }

        .reg-login-link-container p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 12px;
          margin: 0 0 5px 0;
        }

        .reg-login-link-container a {
          color: white;
          font-weight: bold;
          text-decoration: underline;
          font-size: 14px;
        }

        .reg-error {
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 5px;
          padding: 10px 12px;
          font-size: 11px;
          font-weight: 700;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 18px;
          color: white;
        }

        /* ── Mobile View ── */
        @media (max-width: 768px) {
          html, body, #root {
            overflow: auto !important;
            height: auto;
          }
          .reg-container {
            flex-direction: column;
            height: auto;
            min-height: 100vh;
            overflow: visible;
          }
          .reg-left-side {
            display: none;
          }
          .reg-right-side {
            width: 100%;
            height: auto;
            min-height: 100vh;
            padding-right: 0;
            justify-content: center;
          }
          .reg-right-side-card {
            height: auto;
            min-height: 100vh;
            border-radius: 0;
            padding: 40px 20px;
            box-shadow: none;
          }
          .reg-form-inner {
            max-width: 100%;
          }
          .reg-logo {
            height: 100px;
            margin-bottom: 30px;
          }
          .reg-submit-btn {
            padding: 14px;
            font-size: 14px;
            margin-top: 10px;
          }
        }
      `}</style>
      <div className="reg-container">
        <div className="reg-left-side">
          <div className="reg-left-side-card">
            <img src={registerBg} alt="Educational theme" />
          </div>
        </div>
        <div className="reg-right-side">
          <div className="reg-right-side-card">
            <div className="reg-form-inner">
              
              <Link to="/">
                <img src={logoImg} alt="e-Tuitions Logo" className="reg-logo" />
              </Link>
              
              {error && <div className="reg-error">{error}</div>}

              <form onSubmit={submitHandler} className="reg-form">
                
                <div className="reg-input-group">
                  <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="reg-input-group">
                  <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="reg-input-group">
                  <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>

                <div className="reg-input-group">
                  <select value={board} onChange={(e) => setBoard(e.target.value)} required>
                    <option value="" disabled>Select Board</option>
                    <option value="TS Board">TS Board</option>
                    <option value="AP Board">AP Board</option>
                    <option value="CBSE">CBSE Board</option>
                    <option value="ICSE">ICSE Board</option>
                  </select>
                </div>

                <div className="reg-input-group">
                  <select value={className} onChange={(e) => setClassName(e.target.value)} required>
                    <option value="" disabled>Select Class</option>
                    {availableClasses.map((cls, idx) => (
                      <option key={idx} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div className="reg-checkbox-group">
                  <input type="checkbox" id="terms" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} required />
                  <label htmlFor="terms">I agree to <span>Terms &amp; Conditions</span></label>
                </div>

                <button type="submit" className="reg-submit-btn">REGISTER</button>
              </form>

              <div className="reg-login-link-container">
                <p>Already have an account?</p>
                <Link to="/login">Click here to Login</Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
