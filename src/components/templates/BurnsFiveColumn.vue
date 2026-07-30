<script setup>
import { ref, reactive, computed } from 'vue'
import { useEmotionStore } from '@/store'
import { EMOTIONS } from '@/constants/emotions'

const emit = defineEmits(['back', 'saved'])
const store = useEmotionStore()

const currentStep = ref(1)
const selectedEmotion = ref(null)

const form = reactive({
  situation: '',
  autoThought: '',
  autoThoughtBelief: 80,
  cognitiveDistortions: [],
  rationalResponse: '',
  rationalResponseBelief: '',
  result: {
    score: 50,
    note: ''
  }
})

function selectEmotion(em) {
  selectedEmotion.value = selectedEmotion.value?.label === em.label ? null : em
}

const showExample = reactive({
  situation: false,
  autoThought: false,
  cognitiveDistortions: false,
  rationalResponse: false,
  result: false
})

const distortionTypes = [
  { id: 'all-or-nothing', label: '非此即彼思维', desc: '用极端方式看待事物，没有中间地带。例如："如果这次没考满分，我就是个失败者。"' },
  { id: 'catastrophizing', label: '灾难化', desc: '把小事想成灾难。例如："他还没回消息，肯定出大事了。"' },
  { id: 'discounting-positive', label: '否定正面', desc: '拒绝接受正面体验。例如："这次成功只是运气好。"' },
  { id: 'emotional-reasoning', label: '情绪推理', desc: '把情绪当作事实依据。例如："我感觉我很差劲，所以我一定很差劲。"' },
  { id: 'labeling', label: '贴标签', desc: '给自己或他人贴上一个概括性标签。例如："我就是个没用的人。"' },
  { id: 'magnification-minimization', label: '夸大/缩小', desc: '夸大缺点，缩小优点。例如："这点小事我都做不好（却忽略做了很多好事）。"' },
  { id: 'mental-filter', label: '心理过滤', desc: '只关注负面细节，忽略正面。例如：收到10条赞美和1条批评，只记住批评。' },
  { id: 'should-statements', label: '应该陈述', desc: '用"应该""必须"苛求自己或他人。例如："我应该在所有方面都做到完美。"' },
  { id: 'personalization', label: '归己化', desc: '把不相关的事情归咎于自己。例如："他们不开心一定是因为我做了什么。"' },
  { id: 'mind-reading', label: '读心术', desc: '认为自己知道别人在想什么，且通常是负面的。例如："他们一定觉得我很烦。"' }
]

const selectedDistortionLabels = computed(() => {
  return form.cognitiveDistortions.map(id => {
    const d = distortionTypes.find(item => item.id === id)
    return d ? d.label : id
  })
})

function toggleDistortion(id) {
  const idx = form.cognitiveDistortions.indexOf(id)
  if (idx > -1) {
    form.cognitiveDistortions.splice(idx, 1)
  } else {
    form.cognitiveDistortions.push(id)
  }
}

function toggleExample(field) {
  showExample[field] = !showExample[field]
}

function goToStep(step) {
  if (step < 1) step = 1
  if (step > 5) step = 5
  currentStep.value = step
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  } else {
    emit('back')
  }
}

function nextStep() {
  if (currentStep.value < 5) {
    currentStep.value++
  }
}

function canProceed() {
  switch (currentStep.value) {
    case 1: return form.situation.trim().length > 0
    case 2: return form.autoThought.trim().length > 0
    case 3: return form.cognitiveDistortions.length > 0
    case 4: return form.rationalResponse.trim().length > 0
    case 5: return true
    default: return false
  }
}

function save() {
  store.saveRecord({
    emotion: selectedEmotion.value,
    ...form,
    cognitiveDistortions: selectedDistortionLabels.value
  })
  emit('saved')
}

const steps = [
  { num: 1, title: '情境', icon: '📋', subtitle: '发生了什么？' },
  { num: 2, title: '自动思维', icon: '💭', subtitle: '当时在想什么？' },
  { num: 3, title: '认知扭曲', icon: '🔍', subtitle: '这是哪种思维陷阱？' },
  { num: 4, title: '理性回应', icon: '💡', subtitle: '事实是什么？' },
  { num: 5, title: '结果', icon: '📊', subtitle: '现在感觉如何？' }
]
</script>

<template>
  <view class="burns-container">
    <!-- 情绪标签选择 -->
    <view class="emotion-picker">
      <text class="emotion-picker-label">你现在感觉如何？</text>
      <view class="emotion-tags">
        <view
          class="emotion-tag"
          v-for="em in EMOTIONS"
          :key="em.label"
          :class="{ selected: selectedEmotion?.label === em.label }"
          :style="selectedEmotion?.label === em.label ? { borderColor: em.color, background: em.color + '20' } : {}"
          @tap="selectEmotion(em)"
        >
          <text class="emotion-tag-emoji">{{ em.emoji }}</text>
          <text class="emotion-tag-label">{{ em.label }}</text>
        </view>
      </view>
    </view>

    <!-- 步骤进度条 -->
    <view class="step-progress">
      <view
        class="step-dot"
        v-for="(s, i) in steps"
        :key="i"
        :class="{ active: currentStep >= s.num, done: currentStep > s.num }"
        @tap="goToStep(s.num)"
      >
        <text class="step-icon">{{ s.num }}</text>
      </view>
      <view class="progress-line">
        <view class="progress-fill" :style="{ width: ((currentStep - 1) / 4 * 100) + '%' }"></view>
      </view>
    </view>

    <text class="step-title">{{ steps[currentStep - 1].icon }} {{ steps[currentStep - 1].title }}</text>
    <text class="step-subtitle">{{ steps[currentStep - 1].subtitle }}</text>

    <!-- Step 1: 情境 -->
    <view v-show="currentStep === 1" class="step-content">
      <view class="guide-box">
        <text class="guide-title">💡 填写引导</text>
        <text class="guide-text">回忆一下：是什么事情触发了你的情绪？在什么时间、什么地点、和谁在一起？尽量客观地描述，不加评判。</text>
      </view>

      <view class="example-toggle" @tap="toggleExample('situation')">
        <text>{{ showExample.situation ? '收起示例 ▲' : '查看示例 ▼' }}</text>
      </view>
      <view v-if="showExample.situation" class="example-box">
        <text class="example-title">📌 示例</text>
        <text class="example-text">"今天下午在部门会议上，我提出了一个新方案，但主管当众说这个想法不成熟，需要再考虑。会议室里大约有10个人，我感觉所有人都在看我。"</text>
      </view>

      <textarea
        v-model="form.situation"
        class="input-textarea"
        placeholder="描述当时的情景…"
        maxlength="1000"
      />
      <text class="char-count">{{ form.situation.length }}/1000</text>
    </view>

    <!-- Step 2: 自动思维 -->
    <view v-show="currentStep === 2" class="step-content">
      <view class="guide-box">
        <text class="guide-title">💡 填写引导</text>
        <text class="guide-text">在那个情境下，你脑海里闪过了什么念头？可能是非常快的、自动出现的想法。试着把它写下来，不加修饰。</text>
      </view>

      <view class="example-toggle" @tap="toggleExample('autoThought')">
        <text>{{ showExample.autoThought ? '收起示例 ▲' : '查看示例 ▼' }}</text>
      </view>
      <view v-if="showExample.autoThought" class="example-box">
        <text class="example-title">📌 示例</text>
        <text class="example-text">"我果然不行，我的想法总是很差劲。主管肯定觉得我很没用，同事们也一定在笑话我。我根本不适合这份工作。"</text>
      </view>

      <textarea
        v-model="form.autoThought"
        class="input-textarea"
        placeholder="当时脑海中闪过了什么想法？…"
        maxlength="1000"
      />
      <text class="char-count">{{ form.autoThought.length }}/1000</text>

      <view class="belief-section">
        <text class="belief-label">你有多相信这个想法？</text>
        <view class="slider-row">
          <text class="slider-min">0% 完全不信</text>
          <slider
            :value="form.autoThoughtBelief"
            @change="form.autoThoughtBelief = $event.detail.value"
            min="0"
            max="100"
            step="5"
            activeColor="#E8A87C"
            backgroundColor="#F0E0D8"
            blockColor="#D4896B"
          />
          <text class="slider-max">{{ form.autoThoughtBelief }}%</text>
        </view>
      </view>
    </view>

    <!-- Step 3: 认知扭曲 -->
    <view v-show="currentStep === 3" class="step-content">
      <view class="guide-box">
        <text class="guide-title">💡 填写引导</text>
        <text class="guide-text">回顾你刚才写下的自动思维，它属于哪种或哪些认知扭曲？仔细对照每种扭曲的描述，选择最符合的选项（可多选）。</text>
      </view>

      <view class="example-toggle" @tap="toggleExample('cognitiveDistortions')">
        <text>{{ showExample.cognitiveDistortions ? '收起示例 ▲' : '查看示例 ▼' }}</text>
      </view>
      <view v-if="showExample.cognitiveDistortions" class="example-box">
        <text class="example-title">📌 示例</text>
        <text class="example-text">
          "我果然不行" → ❓ 贴标签
          "我的想法总是很差劲" → ❓ 夸大/缩小
          "同事们一定在笑话我" → ❓ 读心术
          "我根本不适合这份工作" → ❓ 非此即彼思维
        </text>
      </view>

      <view class="distortion-list">
        <view
          class="distortion-item"
          v-for="d in distortionTypes"
          :key="d.id"
          @tap="toggleDistortion(d.id)"
          :class="{ selected: form.cognitiveDistortions.includes(d.id) }"
        >
          <view class="distortion-check">
            <text v-if="form.cognitiveDistortions.includes(d.id)">✓</text>
          </view>
          <view class="distortion-info">
            <text class="distortion-label">{{ d.label }}</text>
            <text class="distortion-desc">{{ d.desc }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Step 4: 理性回应 -->
    <view v-show="currentStep === 4" class="step-content">
      <view class="guide-box">
        <text class="guide-title">💡 填写引导</text>
        <text class="guide-text">站在客观的角度，用事实来回应你的自动思维。问问自己：支持这个想法的证据是什么？反对的证据是什么？有没有其他的、更平衡的看待方式？</text>
      </view>

      <view class="example-toggle" @tap="toggleExample('rationalResponse')">
        <text>{{ showExample.rationalResponse ? '收起示例 ▲' : '查看示例 ▼' }}</text>
      </view>
      <view v-if="showExample.rationalResponse" class="example-box">
        <text class="example-title">📌 示例</text>
        <text class="example-text">
          "主管只是对我的方案有不同意见，并不代表我这个人不行。我之前也提出过被采纳的方案，不能因为一次否定就全盘否定自己。同事们在看我是因为会议的正常流程，我无法确定他们在想什么。"
        </text>
      </view>

      <textarea
        v-model="form.rationalResponse"
        class="input-textarea"
        placeholder="用事实和理性来回应自动思维…"
        maxlength="1000"
      />
      <text class="char-count">{{ form.rationalResponse.length }}/1000</text>

      <view class="belief-section">
        <text class="belief-label">你有多相信这个理性回应？</text>
        <view class="slider-row">
          <text class="slider-min">0% 完全不信</text>
          <slider
            :value="form.rationalResponseBelief"
            @change="form.rationalResponseBelief = $event.detail.value"
            min="0"
            max="100"
            step="5"
            activeColor="#E8A87C"
            backgroundColor="#F0E0D8"
            blockColor="#D4896B"
          />
          <text class="slider-max">{{ form.rationalResponseBelief || 0 }}%</text>
        </view>
      </view>
    </view>

    <!-- Step 5: 结果 -->
    <view v-show="currentStep === 5" class="step-content">
      <view class="guide-box">
        <text class="guide-title">💡 填写引导</text>
        <text class="guide-text">经过前面的梳理，你现在感觉如何？给现在的情绪状态打个分，并写下你的感受变化。</text>
      </view>

      <view class="example-toggle" @tap="toggleExample('result')">
        <text>{{ showExample.result ? '收起示例 ▲' : '查看示例 ▼' }}</text>
      </view>
      <view v-if="showExample.result" class="example-box">
        <text class="example-title">📌 示例</text>
        <text class="example-text">"虽然还是有点失落，但不像刚才那么难受了。我意识到一次方案被否并不能定义我的能力。下次我可以先私下和主管沟通，了解他的顾虑后再修改方案。"</text>
      </view>

      <view class="score-section">
        <text class="score-label">现在你的情绪状态评分：</text>
        <view class="score-display">
          <text class="score-value">{{ form.result.score }}</text>
          <text class="score-unit">%</text>
        </view>
        <slider
          :value="form.result.score"
          @change="form.result.score = $event.detail.value"
          min="0"
          max="100"
          step="5"
          activeColor="#E8A87C"
          backgroundColor="#F0E0D8"
          blockColor="#D4896B"
        />
        <view class="score-labels">
          <text>很差</text>
          <text>很好</text>
        </view>
      </view>

      <textarea
        v-model="form.result.note"
        class="input-textarea"
        placeholder="写下经过梳理后的感受和领悟…（可选）"
        maxlength="500"
      />
      <text class="char-count">{{ form.result.note.length }}/500</text>
    </view>

    <!-- 底部导航按钮 -->
    <view class="bottom-actions">
      <button class="btn-secondary" @tap="prevStep">
        {{ currentStep === 1 ? '返回选择模板' : '上一步' }}
      </button>
      <button
        v-if="currentStep < 5"
        class="btn-primary"
        :class="{ disabled: !canProceed() }"
        :disabled="!canProceed()"
        @tap="nextStep"
      >
        下一步
      </button>
      <button
        v-else
        class="btn-primary"
        @tap="save"
      >
        💾 保存记录
      </button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.burns-container {
  padding-bottom: 160rpx;
}

.step-progress {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding: $spacing-lg 0;
  margin: 0 $spacing-md;
}

.progress-line {
  position: absolute;
  top: 50%;
  left: 30rpx;
  right: 30rpx;
  height: 4rpx;
  background: $border-color;
  z-index: 0;
  transform: translateY(-50%);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, $primary-color, $primary-dark);
  border-radius: 2rpx;
  transition: width 0.3s;
}

.step-dot {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: $border-color;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  position: relative;
}

.step-dot.active {
  background: $primary-color;
}

.step-dot.done {
  background: $primary-dark;
}

.step-icon {
  font-size: $font-sm;
  color: #fff;
  font-weight: 600;
}

.step-title {
  font-size: $font-xl;
  font-weight: 600;
  color: $text-primary;
  display: block;
  text-align: center;
  margin-top: $spacing-md;
}

.step-subtitle {
  font-size: $font-md;
  color: $text-secondary;
  display: block;
  text-align: center;
  margin-bottom: $spacing-lg;
}

.step-content {
  padding: 0 $spacing-md;
}

.guide-box {
  background: linear-gradient(135deg, #FFF5EE, #FFE8D6);
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
}

.guide-title {
  font-size: $font-md;
  font-weight: 600;
  color: $primary-dark;
  display: block;
  margin-bottom: $spacing-xs;
}

.guide-text {
  font-size: $font-md;
  color: $text-primary;
  line-height: 1.6;
  display: block;
}

.example-toggle {
  text-align: right;
  padding: $spacing-xs 0;
}

.example-toggle text {
  font-size: $font-sm;
  color: $primary-color;
}

.example-box {
  background: #FDF8F5;
  border-left: 4rpx solid $primary-color;
  border-radius: $radius-sm;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
}

.example-title {
  font-size: $font-md;
  font-weight: 600;
  color: $primary-dark;
  display: block;
  margin-bottom: $spacing-xs;
}

.example-text {
  font-size: $font-md;
  color: $text-primary;
  line-height: 1.6;
  display: block;
  white-space: pre-line;
}

.input-textarea {
  width: 100%;
  min-height: 200rpx;
  background: #FDF8F5;
  border: 1rpx solid $border-color;
  border-radius: $radius-md;
  padding: $spacing-md;
  font-size: $font-md;
  color: $text-primary;
  box-sizing: border-box;
  line-height: 1.6;
}

.char-count {
  font-size: $font-sm;
  color: $text-light;
  display: block;
  text-align: right;
  margin-top: $spacing-xs;
}

.belief-section {
  margin-top: $spacing-lg;
}

.belief-label {
  font-size: $font-md;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: $spacing-sm;
}

.slider-row {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.slider-min, .slider-max {
  font-size: $font-sm;
  color: $text-secondary;
  flex-shrink: 0;
}

.slider-min {
  min-width: 120rpx;
}

.slider-max {
  min-width: 60rpx;
  text-align: right;
  font-weight: 600;
  color: $primary-dark;
}

.slider-row slider {
  flex: 1;
}

/* 认知扭曲 */
.distortion-list {
  margin-top: $spacing-md;
}

.distortion-item {
  display: flex;
  align-items: flex-start;
  gap: $spacing-md;
  background: $card-bg;
  border: 1rpx solid $border-color;
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-sm;
  transition: all 0.2s;
}

.distortion-item.selected {
  border-color: $primary-color;
  background: #FFF5EE;
}

.distortion-check {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border: 2rpx solid $border-color;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 4rpx;
}

.distortion-item.selected .distortion-check {
  background: $primary-color;
  border-color: $primary-color;
}

.distortion-check text {
  color: #fff;
  font-size: $font-sm;
  font-weight: 600;
}

.distortion-info {
  flex: 1;
}

.distortion-label {
  font-size: $font-md;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: $spacing-xs;
}

.distortion-desc {
  font-size: $font-sm;
  color: $text-secondary;
  line-height: 1.5;
  display: block;
}

/* 评分部分 */
.score-section {
  text-align: center;
  margin-bottom: $spacing-lg;
}

.score-label {
  font-size: $font-md;
  color: $text-primary;
  display: block;
  margin-bottom: $spacing-md;
}

.score-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: $spacing-xs;
  margin-bottom: $spacing-md;
}

.score-value {
  font-size: 80rpx;
  font-weight: 700;
  color: $primary-dark;
}

.score-unit {
  font-size: $font-lg;
  color: $text-secondary;
}

.score-labels {
  display: flex;
  justify-content: space-between;
  font-size: $font-sm;
  color: $text-light;
  padding: 0 $spacing-sm;
}

/* 底部按钮 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: $spacing-md;
  padding: $spacing-md;
  background: $bg-color;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.btn-secondary {
  flex: 1;
  background: $card-bg;
  border: 1rpx solid $border-color;
  border-radius: $radius-xl;
  padding: 20rpx;
  font-size: $font-lg;
  color: $text-primary;
  text-align: center;
}

.btn-primary {
  flex: 2;
  background: linear-gradient(135deg, $primary-color, $primary-dark);
  color: #fff;
  border-radius: $radius-xl;
  padding: 20rpx;
  font-size: $font-lg;
  text-align: center;
  border: none;
}

.btn-primary.disabled {
  opacity: 0.5;
}

.emotion-picker {
  padding: $spacing-md;
  text-align: center;
}

.emotion-picker-label {
  font-size: $font-md;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: $spacing-sm;
}

.emotion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
  justify-content: center;
}

.emotion-tag {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rpx;
  padding: $spacing-xs $spacing-sm;
  border: 2rpx solid $border-color;
  border-radius: $radius-md;
  background: $card-bg;
  transition: all 0.2s;
}

.emotion-tag.selected {
  transform: scale(1.1);
}

.emotion-tag-emoji {
  font-size: 36rpx;
}

.emotion-tag-label {
  font-size: 20rpx;
  color: $text-primary;
}
</style>
