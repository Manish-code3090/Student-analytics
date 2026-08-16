import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { activeCenter, role } = useAuth();

  return (
    <div>
      <h2>Dashboard</h2>
      <p>
        Center: {activeCenter?.name} &nbsp;|&nbsp; Role: {role}
      </p>
      {/* TODO: role-specific views — admin (manage batches/classes/teachers),
          teacher (enter marks, manage class), student (view results/analysis) */}
    </div>
  );
}
