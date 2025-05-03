
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Icon from '@/components/ui/icon';

type Boss = {
  name: string;
  race: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  image: string;
}

type Player = {
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
}

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
      
      setBoss({
        name: bossName,
        race: bossRace,
        health: health,
        maxHealth: health,
        attack: attack,
        defense: defense,
        image: bossImage
      });
      
      // Подготовка к битве
      setPlayer({
        health: 100,
        maxHealth: 100,
        attack: 15,
        defense: 10
      });
      setBattleLog([`Босс ${bossName} (${bossRace}) появился на поле битвы!`]);
    } catch (error) {
      setBattleLog([`Ошибка при анализе статистики: ${error}`]);
    }
  };

  const attack = () => {
    if (!boss || boss.health <= 0 || player.health <= 0) return;
    
    // Игрок атакует босса
    const playerDamage = Math.max(1, player.attack - boss.defense / 2);
    const newBossHealth = Math.max(0, boss.health - playerDamage);
    
    // Босс атакует игрока, если ещё жив
    let newPlayerHealth = player.health;
    let bossDamage = 0;
    
    if (newBossHealth > 0) {
      bossDamage = Math.max(1, boss.attack - player.defense / 2);
      newPlayerHealth = Math.max(0, player.health - bossDamage);
    }
    
    // Обновление информации о боссе и игроке
    setBoss({...boss, health: newBossHealth});
    setPlayer({...player, health: newPlayerHealth});
    
    // Добавляем записи в журнал боя
    const newLogs = [
      `Вы наносите ${playerDamage} урона ${boss.name}.`,
      newBossHealth > 0 ? `${boss.name} наносит вам ${bossDamage} урона.` : `${boss.name} повержен!`,
      newPlayerHealth <= 0 ? "Вы проиграли бой!" : ""
    ].filter(log => log);
    
    setBattleLog([...newLogs, ...battleLog]);
    
    // Проверяем, закончился ли бой
    if (newBossHealth <= 0 || newPlayerHealth <= 0) {
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
                Введите статистику вашего босса. Можно указать расу в скобках, например: Горлум (орк)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={bossStats} 
                onChange={(e) => setBossStats(e.target.value)} 
                placeholder="Введите информацию о боссе, например:
Горлум (орк)
здоровье: 150
атака: 20
защита: 8"
                className="min-h-[150px]"
              />
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
                  <span className="text-sm bg-indigo-200 px-2 py-1 rounded-full">{boss.race}</span>
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
                  disabled={!isBattleActive || boss.health <= 0 || player.health <= 0}
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
