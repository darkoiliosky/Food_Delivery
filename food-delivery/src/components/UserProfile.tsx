// import React, { useState } from "react";

// interface UserProfileProps {
//   name: string;
//   email: string;
//   phone: string;
// }

// const UserProfile: React.FC<UserProfileProps> = ({ name, email, phone }) => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [userName, setUserName] = useState(name);
//   const [userEmail, setUserEmail] = useState(email);
//   const [userPhone, setUserPhone] = useState(phone);

//   const handleEditClick = () => {
//     setIsEditing(true);
//   };

//   const handleSaveClick = () => {
//     setIsEditing(false);
//     // Here you can add logic to save the updated user information
//   };

//   return (
//     <div>
//       {isEditing ? (
//         <div>
//           <div>
//             <label>Name:</label>
//             <input
//               type="text"
//               value={userName}
//               onChange={(e) => setUserName(e.target.value)}
//             />
//           </div>
//           <div>
//             <label>Email:</label>
//             <input
//               type="email"
//               value={userEmail}
//               onChange={(e) => setUserEmail(e.target.value)}
//             />
//           </div>
//           <div>
//             <label>Phone:</label>
//             <input
//               type="tel"
//               value={userPhone}
//               onChange={(e) => setUserPhone(e.target.value)}
//             />
//           </div>
//           <button onClick={handleSaveClick}>Save</button>
//         </div>
//       ) : (
//         <div>
//           <div>
//             <strong>Name:</strong> {userName}
//           </div>
//           <div>
//             <strong>Email:</strong> {userEmail}
//           </div>
//           <div>
//             <strong>Phone:</strong> {userPhone}
//           </div>
//           <button onClick={handleEditClick}>Edit</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserProfile;
