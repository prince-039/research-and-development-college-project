import React, { useState } from "react";
import CustomButton from "../../components/CustomButton";
import UpdatePasswordLoggedIn from "../../components/UpdatePasswordLoggedIn";

const Profile = ({ profileData }) => {
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);

  if (!profileData) return null;

  const emergencyContact = profileData.emergencyContact || {};
  const profileImage = profileData.profile
    ? `${process.env.REACT_APP_MEDIA_LINK}/${profileData.profile}`
    : "../user.png";

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center gap-8 mb-12 border-b pb-8 justify-between">
        <div className="flex items-center gap-8">
          <img
            src={profileImage}
            alt="Profile"
            className="w-40 h-40 rounded-full object-cover ring-4 ring-blue-500 ring-offset-4"
          />
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {`${profileData.firstName || ""} ${profileData.lastName || ""}`.trim() ||
                "-"}
            </h1>
            <p className="text-lg text-blue-600 font-medium mb-1 px-2">
              {profileData.designation || "-"}
            </p>
            <p className="text-md text-gray-600 font-medium px-2">
              Computer Science and Engineering
            </p>
          </div>
        </div>
        <div className="flex items-center gap-8 justify-end">
          <CustomButton
            onClick={() => setShowPasswordUpdate(!showPasswordUpdate)}
            variant="primary"
          >
            {showPasswordUpdate ? "Hide" : "Update Password"}
          </CustomButton>
        </div>
        {showPasswordUpdate && (
          <UpdatePasswordLoggedIn
            onClose={() => setShowPasswordUpdate(false)}
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{profileData.email || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-gray-900">{profileData.phone || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Blood Group
              </label>
              <p className="text-gray-900">{profileData.bloodGroup || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Date of Birth
              </label>
              <p className="text-gray-900">{formatDate(profileData.dob) || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Joining Date
              </label>
              <p className="text-gray-900">
                {formatDate(profileData.joiningDate) || "-"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Status
              </label>
              <p className="text-gray-900">
                {profileData.status || "-"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Office
              </label>
              <p className="text-gray-900 capitalize">
                {profileData.address || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
            Publications & Research Areas
          </h2>
        </div>

      </div>
    </div>
  );
};

export default Profile;
