import React, { useEffect, useState } from "react";
import axiosWrapper from "../utils/AxiosWrapper";
import { IoMdClose } from "react-icons/io";
import toast from "react-hot-toast";
import CustomButton from "../components/CustomButton";
import { MdDeleteOutline } from "react-icons/md";
import { publicationFieldConfig } from "../utils/researchPublicationConfig";
import { Edit3, Trash2 } from "lucide-react";
import DeleteConfirm from "../components/DeleteConfirm";
import { useLocation, useParams } from "react-router-dom";

const tabs = ["Journal", "Conference", "Book-Chapter", "Patent"];
const publicationStatusOptions = [
  "published",
  "accepted",
  "submitted",
  "communicated",
  "under review",
  "filed",
  "fer",
  "grant",
];
const publicationCategoryOptions = ["SCI", "SCIE", "Scopus", "Other"];
const scopusIndexOptions = ["yes", "no", "NA"];

const formatDateInput = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().split("T")[0];
};

const ScholarsPublications = ({id}) => {
  const token = localStorage.getItem("userToken");
  const [activeTab, setActiveTab] = useState("Journal");
  const [publications, setPublications]=useState([]);
  const [loading, setLoading]=useState(false);
  const [showPublicationModal, setShowPublicationModal] = useState(false);
  const [publicationForm, setPublicationForm] =useState({});
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen]=useState(false);
  const s_id=useParams();
  const location = useLocation();
  const publicRoutes = ["/researcher-details", "/faculty-details"];
  const isPublicView = publicRoutes.some(route =>
    location.pathname.startsWith(route)
  );
  
  if(!id)
    id=s_id.id;

  const loadData = async () => {
    try{
      setLoading(true);
      const response=await axiosWrapper.get(`/publication/${activeTab}/${id}`);
      if(response.data.success){
        setPublications(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setPublications([]);
      }
    }
    catch(error){
      setPublications([]);
    }
    finally{
      setLoading(false);
    }
  };

  useEffect(()=>{
    loadData();
  },[activeTab, id]);

  const currentData = publications || [];

  const openEditModalPublication = (item) => {
    setPublicationForm({ ...item });
    setShowPublicationModal(true);
  };

  const resetModal = () => {
    setShowPublicationModal(false);
    setPublicationForm({});
  };

  const addPublicationRow = async (e) => {
    e.preventDefault();
    try {
      toast.loading("Creating publication");
      const payload = {
        ...publicationForm,
        scholar: id,
        type: publicationForm.type || activeTab,
      };
      const response = await axiosWrapper.post(
        `/publication/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.dismiss();
      if (response.data.success) {
        toast.success(response.data.message);
        setPublications((prev) =>
          activeTab === payload.type ? [...prev, response.data.data] : prev
        );
        setShowPublicationModal(false);
        resetModal();
        await loadData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.dismiss();
      toast.error(
        error.response?.data?.message || "Failed to create publication",
      );
    }
  };

  const updatePublicationRow = (field, value) => {
    setPublicationForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const deletePublicationRow = async (id) => {
    try {
      toast.loading("Deleting publication");
      const response = await axiosWrapper.delete(`/publication/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.dismiss();
      if (response.data.success) {
        toast.success(response.data.message);
        setShowPublicationModal(false);
        setIsDeleteConfirmOpen(false);
        setPublications((prev) => prev.filter((item) => item._id !== id));
        await loadData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      console.log(error);
      toast.error(
        error.response?.data?.message || "Failed to delete publication",
      );
    }
  };

  const handleSubmit = async (e, id) => {
    e.preventDefault();
    try {
      toast.loading("Updating publication");
      const response = await axiosWrapper.put(
        `/publication/${id}`,
        publicationForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.dismiss();
      if (response.data.success) {
        toast.success(response.data.message);
        setPublications((prev) =>
          prev.map((item) => (item._id === id ? response.data.data : item))
        );
        setShowPublicationModal(false);
        resetModal();
        await loadData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(
        error.response?.data?.message || "Failed to update publication",
      );
    }
  };

  return (<>
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between">
        <div className="flex gap-4 mb-6 border-b pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition 
                ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-200"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {!isPublicView && token && <CustomButton className="max-h-fit mr-10" type="button" onClick={() => openEditModalPublication({type : activeTab})}>
          Add {activeTab}
        </CustomButton>}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm text-left">
          {/* Header */}
          <thead className="bg-gray-200 text-gray-700"> 
            <tr>
              <th className="p-3">S.No.</th>
              <th className="p-3">Title</th>
              <th className="p-3">{activeTab==="Book-Chapter" ? "Book Name" : `${activeTab} Name`}</th>
              {activeTab==="Journal" && <th className="p-3">Category</th> }
              <th className="p-3">{activeTab==="Journal" ? "Impact Factor" : activeTab==="Patent" ? "Application No" : "Scopus Index"}</th>
              {activeTab==="Conference" && <>
                <th className="p-3">Date of Conf.</th>
                <th className="p-3">Venue of Conf.</th>
              </>}
              {activeTab==="Book-Chapter" && <th className="p-3">Publisher</th>}
              <th className="p-3">Status</th>
              {activeTab!=="Patent" ? <th className="p-3">Date of Communication</th> :
              <>
                <th className="p-3">Date of Filed</th>
                <th className="p-3">Date of FER</th>
                <th className="p-3">Date of Grant</th>
                <th className="p-3">Grant No</th>
              </>}
              <th className="p-3">ISBN</th>
              <th className="p-3">Vol No</th>
              <th className="p-3">Article No</th>
              <th className="p-3">Publish Year</th>
              <th className="p-3">Link</th>
              {!isPublicView && token && <th className="p-3">Action </th>}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan="12" className="text-center p-4 text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              currentData.map((item, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">

                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{item.title}</td>
                  <td className="p-3">{item.name}</td>

                  {/* Category Dropdown */}
                  {activeTab==="Journal" && <td className="p-3">
                    <select
                      defaultValue={item.category}
                      className="border rounded px-2 py-1"
                    >
                      <option>SCI</option>
                      <option>SCIE</option>
                      <option>Scopus</option>
                    </select>
                  </td>}

                  <td className="p-3">{item.category==="Scopus" ? item.impact : item.scopusIndex? item.scopusIndex : item.applicationNo ? item.applicationNo : "NA"}</td>
                  {activeTab=="Conference" && <>
                    <td className="p-3">{new Date(item.conferenceDate).toLocaleDateString()}</td>
                    <td className="p-3">{item.conferenceVenue}</td>
                  </>}

                  {activeTab==="Book-Chapter" && <td className="p-3">{item.publisher}</td>}

                  <td className="p-3 capitalize">{item.status}</td>

                  {activeTab==="Patent" ? <>
                    <td className="p-3 ">{item.dateOfFiled ? new Date(item.dateOfFiled).toLocaleDateString() : "NA"}</td>
                    <td className="p-3 ">{item.dateOfFER ? new Date(item.dateOfFER).toLocaleDateString() : "NA"}</td>
                    <td className="p-3 ">{item.dateOfGrant ? new Date(item.dateOfGrant).toLocaleDateString() : "NA"}</td>
                    <td className="p-3 ">{item.grantNo ? item.grantNo : "NA"}</td>
                    </> :
                    <td className="p-3">{item.status === null ? "NA" : new Date(item.communicationDate).toLocaleDateString()}</td>
                  }

                  <td className="p-3">
                    {item.status === "published" ? item.isbn : "NA"}
                  </td>

                  <td className="p-3">
                    {item.status === "published" ? item.volumeNo : "NA"}
                  </td>

                  <td className="p-3">
                    {item.status === "published" ? item.articleNo : "NA"}
                  </td>

                  <td className="p-3">
                    {item.status === "published" ? item.publishedYear : "NA"}
                  </td>

                  <td className="p-3">
                    {item.status === "published" ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        View
                      </a>
                    ) : (
                      "NA"
                    )}
                  </td>
                  {!isPublicView && token && <td className="p-2">
                    <Edit3 className="inline-block mx-1 hover:text-blue-400 cursor-pointer"
                      size={16}
                      onClick={()=> openEditModalPublication(item)}
                    />
                    <Trash2 className="inline-block mx-1 text-red-900 cursor-pointer hover:text-red-500" 
                      size={18} 
                      onClick={() => setIsDeleteConfirmOpen(item._id)}
                    />
                  </td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>

    {showPublicationModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg w-[90%] max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold">Edit Publications</h2>
            <button onClick={resetModal} className="text-gray-500 hover:text-gray-700">
              <IoMdClose className="text-3xl" />
            </button>
          </div>

          <form onSubmit={(e)=> publicationForm._id ? handleSubmit(e, publicationForm._id) : addPublicationRow(e)} className="p-6 space-y-6">
            <div className="mt-4 space-y-4">
              {publicationForm && (
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="mb-4 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">
                      {publicationForm.type} Entry
                    </h3>
                    {publicationForm.title && <CustomButton type="button" variant="danger" className="!p-2" 
                      onClick={() => setIsDeleteConfirmOpen(publicationForm._id)}
                      >
                      <MdDeleteOutline />
                    </CustomButton> }
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(activeTab==="Book-Chapter"? publicationFieldConfig["BookChapter"] : publicationFieldConfig[activeTab]).columns.map(([field, label, type]) => (
                      field === "status" ? (
                        <select
                          key={field}
                          value={publicationForm[field] ?? ""}
                          onChange={(e) => updatePublicationRow(field, e.target.value)}
                          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">{label}</option>
                          {publicationStatusOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : field === "category" ? (
                        <select
                          key={field}
                          value={publicationForm[field] ?? ""}
                          onChange={(e) => updatePublicationRow(field, e.target.value)}
                          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">{label}</option>
                          {publicationCategoryOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : field === "scopusIndex" ? (
                        <select
                          key={field}
                          value={publicationForm[field] ?? ""}
                          onChange={(e) => updatePublicationRow(field, e.target.value)}
                          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">{label}</option>
                          {scopusIndexOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          key={field}
                          type={type === "date" ? "date" : "text"}
                          placeholder={label}
                          value={type === "date" ? formatDateInput(publicationForm[field]) : publicationForm[field] ?? ""}
                          onChange={(e) => updatePublicationRow(field, e.target.value)}
                          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <CustomButton variant="secondary" onClick={resetModal}>
                Cancel
              </CustomButton>
              <CustomButton type="submit" variant="primary">
                {publicationForm.title ? "Update" : "Create"}
              </CustomButton>
            </div>
          </form>
        </div>
      </div>
    )}
    <DeleteConfirm
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={()=> deletePublicationRow(isDeleteConfirmOpen)}
        message="Are you sure you want to delete this researcher?"
      />
  </>);
}

export default ScholarsPublications
