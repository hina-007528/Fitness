import React, { useEffect, useState } from "react";
import styled from "styled-components";
import WorkoutCard from "../components/cards/WorkoutCard";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers";
import { getWorkouts } from "../api";
import { CircularProgress } from "@mui/material";
import { useDispatch } from "react-redux";

const Container = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  padding: 22px 0px;
  overflow-y: scroll;
`;
const Wrapper = styled.div`
  flex: 1;
  max-width: 1600px;
  display: flex;
 
  gap: 22px;
  padding: 0px 16px;
  @media (max-width: 600px) {
    gap: 12px;
    flex-direction: column;
  }
`;
const Left = styled.div`
  flex: 0.2;
  height: fit-content;
  padding: 18px;
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 14px;
  box-shadow: 1px 6px 20px 0px ${({ theme }) => theme.primary + 15};
`;
const Title = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: ${({ theme }) => theme.primary};
  @media (max-width: 600px) {
    font-size: 14px;
  }
`;
const Right = styled.div`
  flex: 1;
`;
const CardWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-bottom: 100px;
  @media (max-width: 600px) {
    gap: 12px;
  }
`;
const Section = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0px 16px;
  gap: 22px;
  padding: 0px 16px;
  @media (max-width: 600px) {
    gap: 12px;
  }
`;
const SecTitle = styled.div`
  font-size: 22px;
  color: ${({ theme }) => theme.text_primary};
  font-weight: 500;
`;

const Workouts = () => {
  const dispatch = useDispatch();
  const [todaysWorkouts, setTodaysWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState("");

  const getTodaysWorkout = async () => {
    setLoading(true);
    const token = localStorage.getItem("fittrack-app-token");
    try {
      const response = await getWorkouts(token, date ? `?date=${date}` : "");
      console.log("Get workouts response:", response);
      setTodaysWorkouts(response?.todaysWorkouts || []);
    } catch (error) {
      console.error("Failed to get workouts:", error);
      setTodaysWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkout = (workoutId) => {
    console.log("Deleting workout:", workoutId);
    setTodaysWorkouts(todaysWorkouts.filter(workout => workout._id !== workoutId));
    // Optionally refresh data from server
    setTimeout(() => getTodaysWorkout(), 500);
  };

  const handleUpdateWorkout = (updatedWorkout) => {
    console.log("Updating workout in UI:", updatedWorkout);
    setTodaysWorkouts(todaysWorkouts.map(workout => 
      workout._id === updatedWorkout._id ? updatedWorkout : workout
    ));
    // Optionally refresh data from server
    setTimeout(() => getTodaysWorkout(), 500);
  };

  useEffect(() => {
    getTodaysWorkout();
  }, [date]);
  return (
    <Container>
      <Wrapper>
        <Left>
          <Title>Select Date</Title>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              onChange={(e) => setDate(`${e.$M + 1}/${e.$D}/${e.$y}`)}
            />
          </LocalizationProvider>
        </Left>
        <Right>
          <Section>
            <SecTitle>Todays Workout</SecTitle>
            {loading ? (
              <CircularProgress />
            ) : (
              <CardWrapper>
                {todaysWorkouts.map((workout) => (
                  <WorkoutCard 
                    key={workout._id}
                    workout={workout} 
                    token={localStorage.getItem("fittrack-app-token")}
                    onUpdate={handleUpdateWorkout}
                    onDelete={handleDeleteWorkout}
                  />
                ))}
              </CardWrapper>
            )}
          </Section>
        </Right>
      </Wrapper>
    </Container>
  );
};

export default Workouts;
