import sys

file_path = 'c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend/src/js/marketing.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target1 = '''async function predictCampaign() {'''
replace1 = '''async function predictCampaign() {
  console.log("Prediction started");
  console.log("Updating dashboard...");
  console.log("Showing results section");'''

if target1 in content:
    content = content.replace(target1, replace1, 1)

target2 = '''      setTimeout(() => {
        barDiv.style.width = probPercent + '%';
        barDiv.style.background = result.will_subscribe 
          ? 'linear-gradient(90deg, #10b981, #34d399)' 
          : 'linear-gradient(90deg, #ef4444, #f87171)';
      }, 50);
      
    } catch (error) {'''

replace2 = '''      setTimeout(() => {
        barDiv.style.width = probPercent + '%';
        barDiv.style.background = result.will_subscribe 
          ? 'linear-gradient(90deg, #10b981, #34d399)' 
          : 'linear-gradient(90deg, #ef4444, #f87171)';
      }, 50);

      const resultsSection = document.getElementById("marketingResultsSection");
      if (resultsSection) {
        resultsSection.style.display = "block";
        resultsSection.style.opacity = "1";
        resultsSection.style.visibility = "visible";

        resultsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
      }

      updateMarketingDashboard();
      createMarketingChart();
      createPerformanceChart();
      
    } catch (error) {'''

if target2 in content:
    content = content.replace(target2, replace2, 1)
else:
    print('Could not find target 2')
    
target3 = '''}
  
  function loadCampaignStats() {'''

replace3 = '''}
  
  function updateMarketingDashboard() {
    loadCampaignStats();
    renderCampaigns();
  }

  function loadCampaignStats() {'''

if target3 in content:
    content = content.replace(target3, replace3, 1)
else:
    print('Could not find target 3')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
