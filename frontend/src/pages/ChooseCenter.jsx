import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

// Shown right after login when a user has 1+ memberships. Picking one exchanges
// the identity token for an active session token scoped to that center + role.
export default function ChooseCenter() {
  const { memberships, selectMembership } = useAuth();
  const navigate = useNavigate();

  const handleSelect = async (membershipId) => {
    const identityToken = localStorage.getItem("identityToken");
    const { data } = await api.post(
      "/auth/select-membership",
      { membershipId },
      { headers: { Authorization: `Bearer ${identityToken}` } }
    );
    selectMembership(data.token, data.activeCenter, data.role);
    navigate("/dashboard");
  };

  return (
    <div>
      <h2>Choose a center</h2>
      <ul>
        {memberships.map((m) => (
          <li key={m._id}>
            <button onClick={() => handleSelect(m._id)}>
              {m.center.name} — {m.role}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
