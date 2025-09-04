export default function TournamentCard({ type, title, prize, onRegister }) {
  const isClassic = type === 'classic';
  
  return (
    <div className="tournament-card bg-white bg-opacity-10 rounded-xl overflow-hidden border border-white border-opacity-20 transition-all hover:bg-opacity-20 backdrop-blur-sm">
      <div className={`tournament-banner h-48 ${isClassic ? 'classic-banner' : 'tdm-banner'} bg-cover bg-center relative`}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/70"></div>
      </div>
      
      <div className="tournament-content p-6">
        <h2 className="tournament-title text-xl font-semibold text-white mb-4 flex items-center">
          <i className={`fas ${isClassic ? 'fa-map-marked-alt' : 'fa-crosshairs'} mr-2`}></i> {title}
        </h2>
        
        <div className="tournament-prize bg-gradient-to-r from-purple-700 via-green-400 to-purple-700 bg-size-200 bg-pos-0 animate-gradient-shift rounded-lg p-3 mb-4 text-center border border-white border-opacity-30">
          <div className="prize-label text-white text-opacity-80 text-sm">Total Prize Pool</div>
          <div className="prize-amount text-white font-bold text-xl animate-pulse">π {prize}</div>
        </div>
        
        <div className="tournament-details mb-4">
          {isClassic ? (
            <>
              <p className="text-white text-opacity-90 mb-2 flex items-center">
                <i className="fas fa-users mr-2"></i> <strong>Squad Mode:</strong> 4-6 players per team
              </p>
              <p className="text-white text-opacity-90 mb-1 flex items-center">
                <i className="fas fa-tag mr-2"></i> <strong>Team Tag:</strong> [B4U] required in team name
              </p>
              <span className="team-tag-example text-white text-opacity-60 text-sm block ml-7">(e.g. [B4U]YourTeamName)</span>
              <p className="text-white text-opacity-90 mb-2 mt-2 flex items-center">
                <i className="fas fa-map mr-2"></i> <strong>Maps:</strong> Erangel, Miramar, Sanhok
              </p>
              <p className="text-white text-opacity-90 mb-2 flex items-center">
                <i className="fas fa-calendar-alt mr-2"></i> <strong>Schedule:</strong> Weekly tournaments
              </p>
            </>
          ) : (
            <>
              <p className="text-white text-opacity-90 mb-2 flex items-center">
                <i className="fas fa-user mr-2"></i> <strong>Modes:</strong> 1v1 Duel & 4v4 Team Battle
              </p>
              <p className="text-white text-opacity-90 mb-2 flex items-center">
                <i className="fas fa-map mr-2"></i> <strong>Maps:</strong> Warehouse, Ruins, Town
              </p>
              <p className="text-white text-opacity-90 mb-2 flex items-center">
                <i className="fas fa-calendar-alt mr-2"></i> <strong>Schedule:</strong> Daily quick matches
              </p>
            </>
          )}
        </div>
        
        <div className="tournament-modes mb-4">
          <h3 className="text-white font-semibold mb-2 flex items-center">
            <i className="fas fa-gamepad mr-2"></i> Tournament {isClassic ? 'Format:' : 'Modes:'}
          </h3>
          
          {isClassic ? (
            <div className="mode-item bg-white bg-opacity-10 rounded-lg p-3 mb-2">
              <h4 className="text-white font-semibold mb-1 flex items-center">
                <i className="fas fa-users mr-2"></i> Squad Battle Royale
              </h4>
              <p className="text-white text-opacity-80 text-sm">Classic PUBG rules with TPP perspective</p>
              <span className="team-tag bg-white bg-opacity-20 border border-white border-opacity-30 rounded px-2 py-1 text-white text-sm inline-block mt-2">
                Team Tag: [B4U]YourTeamName
              </span>
            </div>
          ) : (
            <>
              <div className="mode-item bg-white bg-opacity-10 rounded-lg p-3 mb-2">
                <h4 className="text-white font-semibold mb-1 flex items-center">
                  <i className="fas fa-user mr-2"></i> 1v1 Duel
                </h4>
                <p className="text-white text-opacity-80 text-sm">First player to reach 20 kills wins the match</p>
              </div>
              <div className="mode-item bg-white bg-opacity-10 rounded-lg p-3">
                <h4 className="text-white font-semibold mb-1 flex items-center">
                  <i className="fas fa-users mr-2"></i> 4v4 Team Battle
                </h4>
                <p className="text-white text-opacity-80 text-sm">First team to reach 40 kills wins the match</p>
              </div>
            </>
          )}
        </div>
        
        <h3 className="text-white font-semibold mb-2 flex items-center">
          <i className="fas fa-gavel mr-2"></i> Rules & Regulations:
        </h3>
        
        <ul className="rules-list mb-4">
          {isClassic ? (
            <>
              <li className="text-white text-opacity-80 text-sm mb-1 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-white before:font-bold">Team name must include [B4U] tag (e.g. [B4U]Legends)</li>
              <li className="text-white text-opacity-80 text-sm mb-1 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-white before:font-bold">No hacking or cheating of any kind</li>
              <li className="text-white text-opacity-80 text-sm mb-1 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-white before:font-bold">Players must use their real PUBG IDs</li>
              <li className="text-white text-opacity-80 text-sm mb-1 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-white before:font-bold">Teams must register 30 minutes before match</li>
              <li className="text-white text-opacity-80 text-sm mb-1 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-white before:font-bold">Disconnections will not pause the game</li>
              <li className="text-white text-opacity-80 text-sm mb-1 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-white before:font-bold">Top 3 teams by kills and placement will qualify</li>
            </>
          ) : (
            <>
              <li className="text-white text-opacity-80 text-sm mb-1 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-white before:font-bold">No holding position for more than 5 seconds</li>
              <li className="text-white text-opacity-80 text-sm mb-1 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-white before:font-bold">No camping in spawn areas</li>
              <li className="text-white text-opacity-80 text-sm mb-1 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-white before:font-bold">Only designated weapons allowed</li>
              <li className="text-white text-opacity-80 text-sm mb-1 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-white before:font-bold">Players must maintain sportsmanship</li>
              <li className="text-white text-opacity-80 text-sm mb-1 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-white before:font-bold">Disconnections result in automatic loss</li>
              <li className="text-white text-opacity-80 text-sm mb-1 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-white before:font-bold">No grenades or throwables in 1v1 mode</li>
            </>
          )}
        </ul>
        
        <button 
          onClick={onRegister}
          className="register-btn bg-gradient-to-r from-green-400 to-blue-500 text-black font-bold py-3 px-6 rounded-lg w-full text-center transition-all hover:translate-y-[-2px] hover:shadow-lg"
        >
          <i className="fas fa-user-plus mr-2"></i> Register Now
        </button>
      </div>
    </div>
  );
}
