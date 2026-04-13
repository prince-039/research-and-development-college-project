import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axiosWrapper from "../utils/AxiosWrapper";
import CustomButton from "../components/CustomButton";

const USER_TYPES = {
  STUDENT: "Student",
  FACULTY: "Faculty",
  ADMIN: "Admin",
};

const branchOptions = [
  "CSE",
  "MCA",
  "MTECH",
  "EE",
  "ECE",
  "PIE",
  "META",
  "CIVIL",
  "ME",
];

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const studentInitialFormData = {
  firstName: "",
  middleName: "",
  lastName: "",
  enrollmentNo: "",
  email: "",
  phone: "",
  password: "",
  semester: "",
  branchId: "",
  gender: "",
  dob: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  country: "",
};

const staffInitialFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  country: "",
  gender: "",
  dob: "",
  designation: "",
  joiningDate: "",
  salary: "",
  status: "active",
  bloodGroup: "",
  branchId: "",
  emergencyContact: {
    name: "",
    relationship: "",
    phone: "",
  },
};

const UserTypeSelector = ({ selected, onSelect }) => (
  <div className="mb-8 flex justify-center gap-4">
    {Object.values(USER_TYPES).map((type) => (
      <button
        key={type}
        type="button"
        onClick={() => onSelect(type)}
        className={`min-w-[102px] rounded-full px-7 py-3 text-xl font-medium shadow-sm transition duration-200 ${
          selected === type
            ? "bg-[#3367e8] text-white shadow-[0_6px_18px_rgba(51,103,232,0.28)]"
            : "bg-[#f3f5fb] text-[#111827] hover:bg-[#e9eefc]"
        }`}
      >
        {type}
      </button>
    ))}
  </div>
);

const InputField = ({
  className = "",
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  min,
  max,
  minLength,
}) => (
  <input
    type={type}
    className={`rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    min={min}
    max={max}
    minLength={minLength}
  />
);

const SelectField = ({
  className = "",
  value,
  onChange,
  required = false,
  options,
  placeholder,
}) => (
  <select
    className={`rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    value={value}
    onChange={onChange}
    required={required}
  >
    <option value="">{placeholder}</option>
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get("type");

  const [selected, setSelected] = useState(USER_TYPES.STUDENT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentFormData, setStudentFormData] = useState(studentInitialFormData);
  const [staffFormData, setStaffFormData] = useState(staffInitialFormData);
  const [file, setFile] = useState(null);
  const [branches, setBranches] = useState([]);

  const isStudent = selected === USER_TYPES.STUDENT;
  const isFaculty = selected === USER_TYPES.FACULTY;
  const role = selected.toLowerCase();

  const branchSelectOptions = useMemo(
    () =>
      (branches.length ? branches : branchOptions.map((branch) => ({ _id: branch, name: branch }))).map(
        (branch) => ({
          value: branch._id || branch.branchId || branch.name,
          label: branch.name || branch.branchId,
        })
      ),
    [branches]
  );

  useEffect(() => {
    const userToken = localStorage.getItem("userToken");
    const userType = localStorage.getItem("userType");

    if (userToken) {
      navigate(`/${userType?.toLowerCase() || "student"}`);
    }
  }, [navigate]);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const response = await axiosWrapper.get("/branch");
        if (response.data.success) {
          setBranches(response.data.data);
        }
      } catch (error) {
        setBranches([]);
      }
    };

    loadBranches();
  }, []);

  useEffect(() => {
    if (type) {
      const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
      if (Object.values(USER_TYPES).includes(capitalizedType)) {
        setSelected(capitalizedType);
      }
    }
  }, [type]);

  const handleUserTypeSelect = (userType) => {
    setSelected(userType);
    setFile(null);
    setSearchParams({ type: userType.toLowerCase() });
  };

  const updateStudentField = (field, value) => {
    setStudentFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateStaffField = (field, value) => {
    setStaffFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateEmergencyContactField = (field, value) => {
    setStaffFormData((prev) => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value,
      },
    }));
  };

  const resetCurrentForm = () => {
    if (isStudent) {
      setStudentFormData(studentInitialFormData);
      return;
    }

    setStaffFormData(staffInitialFormData);
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast.loading(`Creating your ${role} account...`);

    try {
      if (isStudent) {
        const response = await axiosWrapper.post("/student/signup", {
          ...studentFormData,
          semester: Number(studentFormData.semester),
        });

        toast.dismiss();
        if (response.data.success) {
          toast.success("Signup successful. Please login with your new account.");
          navigate("/login?type=student");
          resetCurrentForm();
          return;
        }

        toast.error(response.data.message || "Signup failed");
        return;
      }

      if (!file) {
        toast.dismiss();
        toast.error("Please upload a profile photo.");
        return;
      }

      const formData = new FormData();
      Object.entries(staffFormData).forEach(([key, value]) => {
        if (key === "emergencyContact") {
          Object.entries(value).forEach(([subKey, subValue]) => {
            formData.append(`emergencyContact[${subKey}]`, subValue);
          });
          return;
        }

        if (key === "branchId" && !isFaculty) {
          return;
        }

        formData.append(key, value);
      });

      formData.append("file", file);

      const response = await axiosWrapper.post(`/${role}/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.dismiss();
      if (response.data.success) {
        toast.success(
          `${selected} signup successful. Please login with your new password.`
        );
        navigate(`/login?type=${role}`);
        resetCurrentForm();
        return;
      }

      toast.error(response.data.message || "Signup failed");
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = `${selected} Signup`;
  const description = isStudent
    ? "Create a student account to access the college management system."
    : `Create a ${role} account to access the college management system.`;

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-100 via-white to-gray-100 px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800">{title}</h1>
          <p className="mt-3 text-gray-600">{description}</p>
          {!isStudent && (
            <p className="mt-2 text-sm text-gray-500">
              Set your password now and use it to log in after signup.
            </p>
          )}
        </div>

        <UserTypeSelector selected={selected} onSelect={handleUserTypeSelect} />

        <form
          className="grid gap-5 rounded-2xl border border-gray-200 bg-white p-8 shadow-xl md:grid-cols-2"
          onSubmit={handleSubmit}
        >
          {isStudent ? (
            <>
              <InputField
                placeholder="First name"
                required
                value={studentFormData.firstName}
                onChange={(e) => updateStudentField("firstName", e.target.value)}
              />
              <InputField
                placeholder="Middle name"
                value={studentFormData.middleName}
                onChange={(e) => updateStudentField("middleName", e.target.value)}
              />
              <InputField
                placeholder="Last name"
                required
                value={studentFormData.lastName}
                onChange={(e) => updateStudentField("lastName", e.target.value)}
              />
              <InputField
                placeholder="Enrollment number"
                required
                value={studentFormData.enrollmentNo}
                onChange={(e) =>
                  updateStudentField("enrollmentNo", e.target.value)
                }
              />
              <InputField
                type="email"
                placeholder="Email"
                required
                value={studentFormData.email}
                onChange={(e) => updateStudentField("email", e.target.value)}
              />
              <InputField
                placeholder="Phone"
                required
                value={studentFormData.phone}
                onChange={(e) => updateStudentField("phone", e.target.value)}
              />
              <InputField
                type="password"
                placeholder="Password"
                minLength={8}
                required
                value={studentFormData.password}
                onChange={(e) => updateStudentField("password", e.target.value)}
              />
              <InputField
                type="number"
                min="1"
                max="8"
                placeholder="Semester"
                required
                value={studentFormData.semester}
                onChange={(e) => updateStudentField("semester", e.target.value)}
              />
              <SelectField
                required
                value={studentFormData.branchId}
                onChange={(e) => updateStudentField("branchId", e.target.value)}
                placeholder="Select branch"
                options={branchSelectOptions}
              />
              <SelectField
                required
                value={studentFormData.gender}
                onChange={(e) => updateStudentField("gender", e.target.value)}
                placeholder="Select gender"
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                ]}
              />
              <InputField
                type="date"
                required
                value={studentFormData.dob}
                onChange={(e) => updateStudentField("dob", e.target.value)}
              />
              <InputField
                className="md:col-span-2"
                placeholder="Address"
                required
                value={studentFormData.address}
                onChange={(e) => updateStudentField("address", e.target.value)}
              />
              <InputField
                placeholder="City"
                required
                value={studentFormData.city}
                onChange={(e) => updateStudentField("city", e.target.value)}
              />
              <InputField
                placeholder="State"
                required
                value={studentFormData.state}
                onChange={(e) => updateStudentField("state", e.target.value)}
              />
              <InputField
                placeholder="Pincode"
                required
                value={studentFormData.pincode}
                onChange={(e) => updateStudentField("pincode", e.target.value)}
              />
              <InputField
                placeholder="Country"
                required
                value={studentFormData.country}
                onChange={(e) => updateStudentField("country", e.target.value)}
              />
            </>
          ) : (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Profile Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div />
              <InputField
                placeholder="First name"
                required
                value={staffFormData.firstName}
                onChange={(e) => updateStaffField("firstName", e.target.value)}
              />
              <InputField
                placeholder="Last name"
                required
                value={staffFormData.lastName}
                onChange={(e) => updateStaffField("lastName", e.target.value)}
              />
              <InputField
                type="email"
                placeholder="Email"
                required
                value={staffFormData.email}
                onChange={(e) => updateStaffField("email", e.target.value)}
              />
              <InputField
                placeholder="Phone"
                required
                value={staffFormData.phone}
                onChange={(e) => updateStaffField("phone", e.target.value)}
              />
              <InputField
                type="password"
                placeholder="Password"
                minLength={8}
                required
                value={staffFormData.password}
                onChange={(e) => updateStaffField("password", e.target.value)}
              />
              <SelectField
                required
                value={staffFormData.gender}
                onChange={(e) => updateStaffField("gender", e.target.value)}
                placeholder="Select gender"
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                ]}
              />
              <InputField
                type="date"
                required
                value={staffFormData.dob}
                onChange={(e) => updateStaffField("dob", e.target.value)}
              />
              <SelectField
                required
                value={staffFormData.bloodGroup}
                onChange={(e) => updateStaffField("bloodGroup", e.target.value)}
                placeholder="Select blood group"
                options={bloodGroups.map((group) => ({
                  value: group,
                  label: group,
                }))}
              />
              <InputField
                placeholder="Designation"
                required
                value={staffFormData.designation}
                onChange={(e) => updateStaffField("designation", e.target.value)}
              />
              <InputField
                type="date"
                required
                value={staffFormData.joiningDate}
                onChange={(e) => updateStaffField("joiningDate", e.target.value)}
              />
              <InputField
                type="number"
                placeholder="Salary"
                required
                value={staffFormData.salary}
                onChange={(e) => updateStaffField("salary", e.target.value)}
              />
              {isFaculty && (
                <SelectField
                  required
                  value={staffFormData.branchId}
                  onChange={(e) => updateStaffField("branchId", e.target.value)}
                  placeholder="Select branch"
                  options={branchSelectOptions}
                />
              )}
              <InputField
                className="md:col-span-2"
                placeholder="Address"
                required
                value={staffFormData.address}
                onChange={(e) => updateStaffField("address", e.target.value)}
              />
              <InputField
                placeholder="City"
                required
                value={staffFormData.city}
                onChange={(e) => updateStaffField("city", e.target.value)}
              />
              <InputField
                placeholder="State"
                required
                value={staffFormData.state}
                onChange={(e) => updateStaffField("state", e.target.value)}
              />
              <InputField
                placeholder="Pincode"
                required
                value={staffFormData.pincode}
                onChange={(e) => updateStaffField("pincode", e.target.value)}
              />
              <InputField
                placeholder="Country"
                required
                value={staffFormData.country}
                onChange={(e) => updateStaffField("country", e.target.value)}
              />
              <div className="md:col-span-2">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">
                  Emergency Contact
                </h3>
                <div className="grid gap-5 md:grid-cols-3">
                  <InputField
                    placeholder="Name"
                    required
                    value={staffFormData.emergencyContact.name}
                    onChange={(e) =>
                      updateEmergencyContactField("name", e.target.value)
                    }
                  />
                  <InputField
                    placeholder="Relationship"
                    required
                    value={staffFormData.emergencyContact.relationship}
                    onChange={(e) =>
                      updateEmergencyContactField("relationship", e.target.value)
                    }
                  />
                  <InputField
                    placeholder="Phone"
                    required
                    value={staffFormData.emergencyContact.phone}
                    onChange={(e) =>
                      updateEmergencyContactField("phone", e.target.value)
                    }
                  />
                </div>
              </div>
            </>
          )}

          <div className="md:col-span-2">
            <CustomButton
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-[#3367e8] px-4 py-3.5 text-lg font-semibold text-white shadow-[0_6px_18px_rgba(51,103,232,0.28)] transition duration-200 hover:bg-[#2c5ddb]"
            >
              {isSubmitting ? "Creating Account..." : "Sign Up"}
            </CustomButton>
          </div>

          <div className="md:col-span-2 text-center text-sm text-gray-600">
            Already have a {role} account?{" "}
            <Link
              className="font-medium text-blue-600 hover:underline"
              to={`/login?type=${role}`}
            >
              Login here
            </Link>
          </div>
        </form>
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
}
