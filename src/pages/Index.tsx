
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Icon from '@/components/ui/icon';

type Minion = {
  name: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  image: string;
}

type Boss = {
  name: string;
  race: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  image: string;
  currentPhase: number;
  totalPhases: number;
  isLeader: boolean;
  minions: Minion[];
}

type Player = {
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
}

// Массив изображений для расы капибар
const capybaraImages = [
  "https://cdn.poehali.dev/files/bf1b1956-6627-48f7-a163-03bef9059a4b.jpg",
  "https://cdn.poehali.dev/files/75a4aa97-cc64-4314-9c76-59c29feca3cf.jpg",
  "https://cdn.poehali.dev/files/4e2cbfd9-30da-49df-b71b-7279960ec620.jpeg"
];

// Массив потенциальных призываемых миньонов для капибар-лидеров
const capybaraMinions = [
  { 
    name: "Малыш Капи", 
    health: 30, 
    maxHealth: 30, 
    attack: 10, 
    defense: 3, 
    image: capybaraImages[0]
  },
  {
    name: "Капибара-разведчик",
    health: 20,
    maxHealth: 20,
    attack: 15,
    defense: 2,
    image: capybaraImages[1]
  },
  {
    name: "Пухлая капибара",
    health: 50,
    maxHealth: 50,
    attack: 5,
    defense: 7,
    image: capybaraImages[2]
  }
];

const Index = () => {
  const [bossStats, setBossStats] = useState<string>('');
  const [boss, setBoss] = useState<Boss | null>(null);
  const [player, setPlayer] = useState<Player>({
    health: 100,
    maxHealth: 100,
    attack: 15,
    defense: 10
  });
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isBattleActive, setIsBattleActive] = useState<boolean>(false);
  const [phasesCount, setPhasesCount] = useState<string>("1");
  const [isLeader, setIsLeader] = useState<boolean>(false);

  const parseStats = () => {
    try {
      // Находим имя и расу босса, если она указана в скобках
      const statsText = bossStats.trim();
      let bossName = "Босс";
      let bossRace = "Неизвестный";
      
      // Попытка найти расу в скобках
      const raceMatch = statsText.match(/\(([^)]+)\)/);
      if (raceMatch && raceMatch[1]) {
        bossRace = raceMatch[1].trim();
      }
      
      // Извлекаем имя босса из первой строки или первого слова
      const lines = statsText.split('\n');
      if (lines.length > 0) {
        const firstLine = lines[0].replace(/\([^)]*\)/g, '').trim();
        if (firstLine) bossName = firstLine;
      }
      
      // Анализ текста для извлечения параметров босса
      const healthMatch = statsText.match(/здоровье:?\s*(\d+)/i) || statsText.match(/hp:?\s*(\d+)/i);
      const attackMatch = statsText.match(/атака:?\s*(\d+)/i) || statsText.match(/attack:?\s*(\d+)/i);
      const defenseMatch = statsText.match(/защита:?\s*(\d+)/i) || statsText.match(/defense:?\s*(\d+)/i);
      
      const health = healthMatch ? parseInt(healthMatch[1]) : 100;
      const attack = attackMatch ? parseInt(attackMatch[1]) : 20;
      const defense = defenseMatch ? parseInt(defenseMatch[1]) : 5;
      
      // Создаем босса и изображение в зависимости от расы
      let bossImage = "";
      
      // Проверяем принадлежность к расе капибар и выбираем случайное изображение из массива
      if (bossRace.toLowerCase() === "капибара" || bossRace.toLowerCase() === "capybara") {
        const randomIndex = Math.floor(Math.random() * capybaraImages.length);
        bossImage = capybaraImages[randomIndex];
      } else {
        switch(bossRace.toLowerCase()) {
          case "орк": 
          case "orc": 
            bossImage = "https://images.unsplash.com/photo-1615678815958-5910c6811c25?w=300&q=80"; 
            break;
          case "эльф": 
          case "elf": 
            bossImage = "https://images.unsplash.com/photo-1604076913837-52ab5629fba9?w=300&q=80"; 
            break;
          case "демон": 
          case "demon": 
            bossImage = "https://images.unsplash.com/photo-1590586767908-800584c03c71?w=300&q=80"; 
            break;
          default: 
            bossImage = "https://images.unsplash.com/photo-1577493340887-b7bfff550145?w=300&q=80";
        }
      }
      
      // Создаем и инициализируем босса с указанным количеством фаз
      const totalPhases = parseInt(phasesCount);
      const isCapybaraLeader = isLeader && (bossRace.toLowerCase() === "капибара" || bossRace.toLowerCase() === "capybara");
      
      // Создаем миньонов, если это капибара-лидер
      const minions: Minion[] = [];
      if (isCapybaraLeader) {
        // Случайно выбираем 1-2 миньона для призыва
        const minionCount = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < minionCount; i++) {
          const randomMinionIndex = Math.floor(Math.random() * capybaraMinions.length);
          minions.push({...capybaraMinions[randomMinionIndex]});
        }
      }
      
      setBoss({
        name: bossName,
        race: bossRace,
        health: health,
        maxHealth: health,
        attack: attack,
        defense: defense,
        image: bossImage,
        currentPhase: 1,
        totalPhases: totalPhases,
        isLeader: isCapybaraLeader,
        minions: minions
      });
      
      // Подготовка к битве
      setPlayer({
        health: 100,
        maxHealth: 100,
        attack: 15,
        defense: 10
      });
      
      // Добавляем специальное сообщение для капибар
      let initialMessage = `Босс ${bossName} (${bossRace}) появился на поле битвы!`;
      
      if (bossRace.toLowerCase() === "капибара" || bossRace.toLowerCase() === "capybara") {
        initialMessage += " Эта милая и опасная капибара выглядит решительно!";
      }
      
      if (totalPhases > 1) {
        initialMessage += ` У босса ${totalPhases} ${totalPhases === 1 ? 'фаза' : totalPhases < 5 ? 'фазы' : 'фаз'}!`;
      }
      
      if (isCapybaraLeader) {
        initialMessage += " Это капибара-лидер!";
        if (minions.length > 0) {
          initialMessage += ` Лидер призвал ${minions.length} ${minions.length === 1 ? 'миньона' : 'миньонов'} на помощь!`;
        }
      }
      
      setBattleLog([initialMessage]);
    } catch (error) {
      setBattleLog([`Ошибка при анализе статистики: ${error}`]);
    }
  };

  const attack = () => {
    if (!boss || boss.health <= 0 || player.health <= 0) return;
    
    // Игрок атакует босса
    const playerDamage = Math.max(1, player.attack - boss.defense / 2);
    let newBossHealth = Math.max(0, boss.health - playerDamage);
    
    // Обработка смены фазы или перехода к следующей фазе
    let newCurrentPhase = boss.currentPhase;
    let phaseChanged = false;
    
    // Проверяем, нужно ли переходить к следующей фазе
    if (newBossHealth <= 0 && boss.currentPhase < boss.totalPhases) {
      newCurrentPhase++;
      phaseChanged = true;
      
      // Восстанавливаем здоровье для новой фазы (с некоторыми изменениями)
      const phaseHealthFactor = 1 - ((newCurrentPhase - 1) * 0.15); // Каждая следующая фаза имеет меньше здоровья
      newBossHealth = Math.ceil(boss.maxHealth * phaseHealthFactor);
      
      // Увеличиваем атаку босса в каждой новой фазе
      const newBoss = {
        ...boss,
        health: newBossHealth,
        attack: Math.ceil(boss.attack * 1.2), // На 20% больше атаки в каждой фазе
        currentPhase: newCurrentPhase
      };
      
      setBoss(newBoss);
    } else {
      setBoss({...boss, health: newBossHealth});
    }
    
    // Если бой продолжается, босс и миньоны атакуют игрока
    let newPlayerHealth = player.health;
    let bossDamage = 0;
    let minionDamages: { minionName: string, damage: number }[] = [];
    
    if (newBossHealth > 0 || phaseChanged) {
      // Босс атакует
      bossDamage = Math.max(1, boss.attack - player.defense / 2);
      newPlayerHealth = Math.max(0, newPlayerHealth - bossDamage);
      
      // Если у босса есть миньоны (для капибары-лидера), они тоже атакуют
      if (boss.isLeader && boss.minions.length > 0) {
        boss.minions.forEach(minion => {
          if (newPlayerHealth > 0) {
            const minionDamage = Math.max(1, minion.attack - player.defense / 3);
            newPlayerHealth = Math.max(0, newPlayerHealth - minionDamage);
            minionDamages.push({ minionName: minion.name, damage: minionDamage });
          }
        });
      }
    }
    
    setPlayer({...player, health: newPlayerHealth});
    
    // Добавляем записи в журнал боя
    let newLogs = [];
    const isCapybara = boss.race.toLowerCase() === "капибара" || boss.race.toLowerCase() === "capybara";
    
    // Сообщение об атаке игрока
    if (isCapybara) {
      newLogs.push(`Вы наносите ${playerDamage} урона ${boss.name}. Капибара недовольно фыркает!`);
    } else {
      newLogs.push(`Вы наносите ${playerDamage} урона ${boss.name}.`);
    }
    
    // Сообщение о смене фазы
    if (phaseChanged) {
      newLogs.push(`${boss.name} переходит в фазу ${newCurrentPhase}/${boss.totalPhases}! Его атака усиливается!`);
    }
    
    // Сообщение об атаке босса
    if (newBossHealth > 0 || phaseChanged) {
      if (isCapybara) {
        newLogs.push(`${boss.name} атакует вас мощным укусом на ${bossDamage} урона!`);
      } else {
        newLogs.push(`${boss.name} наносит вам ${bossDamage} урона.`);
      }
      
      // Сообщения об атаках миньонов
      minionDamages.forEach(({ minionName, damage }) => {
        newLogs.push(`${minionName} кусает вас на ${damage} урона!`);
      });
    }
    
    // Сообщение о поражении босса
    if (newBossHealth <= 0 && !phaseChanged) {
      if (isCapybara) {
        newLogs.push(`${boss.name} повержен! Капибара мирно уходит купаться.`);
      } else {
        newLogs.push(`${boss.name} повержен!`);
      }
    }
    
    // Сообщение о поражении игрока
    if (newPlayerHealth <= 0) {
      if (isCapybara) {
        newLogs.push("Вы проиграли бой! Капибара торжествующе пищит!");
      } else {
        newLogs.push("Вы проиграли бой!");
      }
    }
    
    setBattleLog(prev => [...newLogs, ...prev]);
    
    // Проверяем, закончился ли бой (босс побежден и нет больше фаз, или игрок проиграл)
    if ((newBossHealth <= 0 && !phaseChanged) || newPlayerHealth <= 0) {
      setIsBattleActive(false);
    }
  };

  const startBattle = () => {
    parseStats();
    setIsBattleActive(true);
  };

  const reset = () => {
    setBoss(null);
    setBossStats('');
    setBattleLog([]);
    setIsBattleActive(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-100 to-indigo-200 p-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-indigo-800 my-6">Создатель боссов для битвы</h1>
        
        {!boss ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Создать босса</CardTitle>
              <CardDescription>
                Введите статистику вашего босса. Можно указать расу в скобках, например: Горлум (орк), Кроко (капибара)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                value={bossStats} 
                onChange={(e) => setBossStats(e.target.value)} 
                placeholder="Введите информацию о боссе, например:
Кроко (капибара)
здоровье: 150
атака: 20
защита: 8"
                className="min-h-[150px]"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phases">Количество фаз</Label>
                  <Select value={phasesCount} onValueChange={setPhasesCount}>
                    <SelectTrigger id="phases">
                      <SelectValue placeholder="Выберите количество фаз" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 фаза</SelectItem>
                      <SelectItem value="2">2 фазы</SelectItem>
                      <SelectItem value="3">3 фазы</SelectItem>
                      <SelectItem value="4">4 фазы</SelectItem>
                      <SelectItem value="5">5 фаз</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2 h-full">
                  <Label htmlFor="leader-toggle" className="flex-grow">
                    {isLeader ? "Капибара-лидер (может призывать других капибар)" : "Обычный босс"}
                  </Label>
                  <Button 
                    id="leader-toggle"
                    variant={isLeader ? "default" : "outline"} 
                    className="w-24"
                    onClick={() => setIsLeader(!isLeader)}
                  >
                    {isLeader ? "Лидер" : "Обычный"}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={startBattle} className="bg-indigo-600 hover:bg-indigo-700">
                <Icon name="Swords" className="mr-2" size={18} />
                Создать и начать бой
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{boss.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm bg-indigo-200 px-2 py-1 rounded-full">{boss.race}</span>
                    {boss.totalPhases > 1 && (
                      <span className="text-sm bg-red-200 px-2 py-1 rounded-full">
                        Фаза {boss.currentPhase}/{boss.totalPhases}
                      </span>
                    )}
                    {boss.isLeader && (
                      <span className="text-sm bg-yellow-200 px-2 py-1 rounded-full">
                        Лидер
                      </span>
                    )}
                  </div>
                </CardTitle>
                <CardDescription>Враг</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <img src={boss.image} alt={boss.name} className="w-full h-48 object-cover rounded-md" />
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Здоровье: {boss.health}/{boss.maxHealth}</span>
                      <span>{Math.floor((boss.health / boss.maxHealth) * 100)}%</span>
                    </div>
                    <Progress value={(boss.health / boss.maxHealth) * 100} className="h-2 bg-gray-200" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-2 rounded-md shadow-sm">
                      <div className="text-sm text-gray-500">Атака</div>
                      <div className="font-bold text-lg">{boss.attack}</div>
                    </div>
                    <div className="bg-white p-2 rounded-md shadow-sm">
                      <div className="text-sm text-gray-500">Защита</div>
                      <div className="font-bold text-lg">{boss.defense}</div>
                    </div>
                  </div>
                  
                  {/* Отображение миньонов, если это капибара-лидер */}
                  {boss.isLeader && boss.minions.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold mb-2">Призванные миньоны:</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {boss.minions.map((minion, index) => (
                          <div key={index} className="bg-white p-2 rounded-md flex items-center">
                            <img 
                              src={minion.image} 
                              alt={minion.name} 
                              className="w-10 h-10 object-cover rounded-full mr-2" 
                            />
                            <div>
                              <div className="font-semibold text-xs">{minion.name}</div>
                              <div className="text-xs">Атака: {minion.attack} | Защита: {minion.defense}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Вы</CardTitle>
                <CardDescription>Герой</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <img src="https://images.unsplash.com/photo-1509822929063-6b6cfc9b42f2?w=300&q=80" alt="Герой" className="w-full h-48 object-cover rounded-md" />
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Здоровье: {player.health}/{player.maxHealth}</span>
                      <span>{Math.floor((player.health / player.maxHealth) * 100)}%</span>
                    </div>
                    <Progress value={(player.health / player.maxHealth) * 100} className="h-2 bg-gray-200" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-2 rounded-md shadow-sm">
                      <div className="text-sm text-gray-500">Атака</div>
                      <div className="font-bold text-lg">{player.attack}</div>
                    </div>
                    <div className="bg-white p-2 rounded-md shadow-sm">
                      <div className="text-sm text-gray-500">Защита</div>
                      <div className="font-bold text-lg">{player.defense}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  onClick={attack} 
                  disabled={!isBattleActive || (boss.health <= 0 && boss.currentPhase === boss.totalPhases) || player.health <= 0}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
                >
                  <Icon name="Sword" className="mr-2" size={18} />
                  Атаковать
                </Button>
                <Button onClick={reset} variant="outline">
                  <Icon name="RefreshCw" className="mr-2" size={18} />
                  Сбросить
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Журнал боя</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 overflow-y-auto bg-white p-3 rounded-md">
                  {battleLog.map((log, index) => (
                    <div key={index} className="mb-1 pb-1 border-b border-gray-100">
                      {log}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
