# 🎯 Weighted Random Selection Explanation

## How `getWeightedRandomResult()` Works

This function implements a probability system where different prizes have different chances of being selected, making rare prizes truly rare while keeping common prizes frequent.

### 📊 **Step 1: Calculate Total Weight**

```javascript
const totalWeight = sections.reduce((sum, section) => sum + section.weight, 0);
```

- **Adds up all weights**: 30 + 3 + 5 + 4 + 25 + 12 + 10 + 6 + 3 + 1 + 1 = **100**
- **Creates total range** for random selection

### 🎲 **Step 2: Generate Random Number**

```javascript
let randomNum = Math.random() * totalWeight;
```

- **`Math.random()`** gives 0.0 to 0.999...
- **Multiply by 100** gives 0 to 99.999...
- **Example**: Random number might be `47.3`

### 🔍 **Step 3: Find Which Section It Lands In**

```javascript
for (let i = 0; i < sections.length; i++) {
	randomNum -= sections[i].weight;
	if (randomNum <= 0) {
		return sections[i].name;
	}
}
```

Let's trace through with **randomNum = 47.3**:

| Section      | Weight | randomNum After  | Check         | Result               |
| ------------ | ------ | ---------------- | ------------- | -------------------- |
| TRY AGAIN    | 30     | 47.3 - 30 = 17.3 | 17.3 > 0      | Continue             |
| QUIZ 10 USDC | 3      | 17.3 - 3 = 14.3  | 14.3 > 0      | Continue             |
| 5 USDC       | 5      | 14.3 - 5 = 9.3   | 9.3 > 0       | Continue             |
| 1 SUI        | 4      | 9.3 - 4 = 5.3    | 5.3 > 0       | Continue             |
| NOTHING      | 25     | 5.3 - 25 = -19.7 | **-19.7 ≤ 0** | **RETURN "NOTHING"** |

### 📈 **Visual Representation**

Think of it like a number line from 0-100:

```
0    30    33    38    42    67    79    89    95    98    99   100
|----TRY---|Q|--5U|1S|------NOTHING------|FOOD|SNACK|MERCH|2K|N|W|
     AGAIN                                                  A  A
                                                           I  I
                                                           R  T
                                                           A  E
                                                             R
```

### 🎯 **Why This Works**

- **Larger weights** = bigger sections on the number line
- **Random number** lands somewhere on 0-100
- **Subtracting weights** moves us through each section
- **First negative result** = we've "landed" in that section

### 💡 **Real Example**

If random number is **85**:

- 85 - 30 = 55 (still positive, skip TRY AGAIN)
- 55 - 3 = 52 (still positive, skip QUIZ)
- 52 - 5 = 47 (still positive, skip 5 USDC)
- 47 - 4 = 43 (still positive, skip 1 SUI)
- 43 - 25 = 18 (still positive, skip NOTHING)
- 18 - 12 = 6 (still positive, skip FOOD)
- 6 - 10 = **-4** ← **WINNER: "SNACK"**

This ensures **NOTHING** (25% weight) is 25 times more likely than **5000 NAIRA** (1% weight)!

## 🎊 Current Probability Distribution

### 💰 **Main Prizes (RARE)**

- **5000 NAIRA**: 1% chance (rarest!)
- **QUIZ 10 USDC**: 3% chance
- **2K AIRTIME**: 3% chance
- **1 SUI**: 4% chance
- **5 USDC**: 5% chance

### 🎪 **Common Results**

- **TRY AGAIN**: 30% chance (keeps them playing)
- **NOTHING**: 25% chance
- **FOOD**: 12% chance
- **SNACK**: 10% chance
- **MERCH**: 6% chance
- **1 WATER**: 1% chance

### ⚙️ **Key Features**

- **Visual fairness**: Wheel still shows equal sections
- **Backend probability**: Uses weighted random selection
- **Rare prizes**: Main monetary prizes have low chances
- **Balanced experience**: Users still win something often
- **Transparent logging**: Console shows actual results

## 🔧 **Technical Implementation**

The system separates visual representation from actual probability:

1. **Wheel spins normally** with equal visual sections
2. **Animation completes** for visual satisfaction
3. **Weighted selection runs** to determine actual result
4. **User sees result** that matches the probability distribution

This approach maintains the excitement of spinning while ensuring proper prize distribution for business requirements.
