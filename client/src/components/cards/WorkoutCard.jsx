import { FitnessCenterRounded, TimelapseRounded, Edit, Delete } from "@mui/icons-material";
import React, { useState } from "react";
import styled from "styled-components";
import { deleteWorkout, updateWorkout } from "../../api";

const Card = styled.div`
  flex: 1;
  min-width: 250px;
  max-width: 400px;
  padding: 16px 18px;
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 14px;
  box-shadow: 1px 6px 20px 0px ${({ theme }) => theme.primary + 15};
  display: flex;
  flex-direction: column;
  gap: 6px;
  @media (max-width: 600px) {
    padding: 12px 14px;
  }
`;
const Category = styled.div`
  width: fit-content;
  font-size: 14px;
  color: ${({ theme }) => theme.primary};
  font-weight: 500;
  background: ${({ theme }) => theme.primary + 20};
  padding: 4px 10px;
  border-radius: 8px;
`;
const Name = styled.div`
  font-size: 20px;
  color: ${({ theme }) => theme.text_primary};
  font-weight: 600;
`;
const Sets = styled.div`
  font-size: 15px;
  color: ${({ theme }) => theme.text_secondary};
  font-weight: 500;
  display: flex;
  gap: 6px;
`;
const Flex = styled.div`
  display: flex;
  gap: 16px;
`;
const Details = styled.div`
  font-size: 15px;
  color: ${({ theme }) => theme.text_primary};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled.button`
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;
  &:hover {
    transform: scale(1.05);
  }
`;

const EditButton = styled(ActionButton)`
  background: ${({ theme }) => theme.primary + 20};
  color: ${({ theme }) => theme.primary};
`;

const DeleteButton = styled(ActionButton)`
  background: ${({ theme }) => theme.text_primary + 20};
  color: ${({ theme }) => theme.text_primary};
`;

const EditForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
`;

const EditInput = styled.input`
  padding: 6px 8px;
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 6px;
  font-size: 14px;
`;

const WorkoutCard = ({ workout, token, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    workoutName: workout?.workoutName || "",
    sets: workout?.sets || "",
    reps: workout?.reps || "",
    weight: workout?.weight || "",
    duration: workout?.duration || "",
  });

  // Only show edit/delete functionality if all required props are provided
  const hasEditDeleteFunctionality = token && onUpdate && onDelete;

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this workout?")) {
      try {
        const response = await deleteWorkout(token, workout._id);
        console.log("Delete response:", response);
        if (response.success) {
          onDelete(workout._id);
        } else {
          alert("Failed to delete workout: " + (response.message || "Unknown error"));
        }
      } catch (error) {
        console.error("Failed to delete workout:", error);
        alert("Failed to delete workout: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await updateWorkout(token, workout._id, editForm);
      console.log("Update response:", response);
      if (response.success) {
        onUpdate(response.data);
        setIsEditing(false);
      } else {
        alert("Failed to update workout: " + (response.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Failed to update workout:", error);
      alert("Failed to update workout: " + (error.response?.data?.message || error.message));
    }
  };

  const handleChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Card>
      <Category>#{workout?.category}</Category>
      <Name>{workout?.workoutName}</Name>
      <Sets>
        Count: {workout?.sets} sets X {workout?.reps} reps
      </Sets>
      <Flex>
        <Details>
          <FitnessCenterRounded sx={{ fontSize: "20px" }} />
          {workout?.weight} kg
        </Details>
        <Details>
          <TimelapseRounded sx={{ fontSize: "20px" }} />
          {workout?.duration} min
        </Details>
      </Flex>

      {isEditing ? (
        <EditForm onSubmit={handleUpdate}>
          <EditInput
            type="text"
            name="workoutName"
            value={editForm.workoutName}
            onChange={handleChange}
            placeholder="Workout Name"
          />
          <EditInput
            type="number"
            name="sets"
            value={editForm.sets}
            onChange={handleChange}
            placeholder="Sets"
          />
          <EditInput
            type="number"
            name="reps"
            value={editForm.reps}
            onChange={handleChange}
            placeholder="Reps"
          />
          <EditInput
            type="number"
            name="weight"
            value={editForm.weight}
            onChange={handleChange}
            placeholder="Weight (kg)"
          />
          <EditInput
            type="number"
            name="duration"
            value={editForm.duration}
            onChange={handleChange}
            placeholder="Duration (min)"
          />
          <Actions>
            <ActionButton type="submit">Save</ActionButton>
            <ActionButton type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </ActionButton>
          </Actions>
        </EditForm>
      ) : hasEditDeleteFunctionality ? (
        <Actions>
          <EditButton onClick={() => setIsEditing(true)}>
            <Edit sx={{ fontSize: "16px" }} />
            Edit
          </EditButton>
          <DeleteButton onClick={handleDelete}>
            <Delete sx={{ fontSize: "16px" }} />
            Delete
          </DeleteButton>
        </Actions>
      ) : null}
    </Card>
  );
};

export default WorkoutCard;
